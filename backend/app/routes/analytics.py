from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from io import BytesIO
import base64
from ..models.event import Event
from .. import db
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)

def create_plotly_figure(fig):
    img_bytes = BytesIO()
    fig.write_image(img_bytes, format='png')
    img_bytes.seek(0)
    return base64.b64encode(img_bytes.getvalue()).decode()

@analytics_bp.route('/sales-trend', methods=['GET'])
@jwt_required()
def get_sales_trend():
    # Get orders from Shopify
    client = current_app.shopify_client
    query = """
    query {
        orders(first: 100) {
            edges {
                node {
                    totalPriceSet {
                        shopMoney {
                            amount
                        }
                    }
                    createdAt
                }
            }
        }
    }
    """
    
    result = client.execute(query)
    orders = result['orders']['edges']
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {
            'date': order['node']['createdAt'].split('T')[0],
            'amount': float(order['node']['totalPriceSet']['shopMoney']['amount'])
        }
        for order in orders
    ])
    
    # Group by date and sum amounts
    daily_sales = df.groupby('date')['amount'].sum().reset_index()
    
    # Create line plot
    fig = px.line(daily_sales, x='date', y='amount',
                  title='Daily Sales Trend',
                  labels={'date': 'Date', 'amount': 'Sales Amount ($)'})
    
    return jsonify({
        'plot': create_plotly_figure(fig)
    })

@analytics_bp.route('/event-distribution', methods=['GET'])
@jwt_required()
def get_event_distribution():
    user_id = get_jwt_identity()
    
    # Get events from PostgreSQL
    stats = db.session.query(
        Event.event_type,
        func.count(Event.id).label('count')
    ).filter_by(user_id=user_id).group_by(Event.event_type).all()
    
    # Create pie chart
    fig = go.Figure(data=[go.Pie(
        labels=[stat[0] for stat in stats],
        values=[stat[1] for stat in stats]
    )])
    
    fig.update_layout(title='Event Distribution')
    
    return jsonify({
        'plot': create_plotly_figure(fig)
    })

@analytics_bp.route('/user-activity', methods=['GET'])
@jwt_required()
def get_user_activity():
    user_id = get_jwt_identity()
    
    # Get events from PostgreSQL for the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    events = db.session.query(
        func.date(Event.created_at).label('date'),
        Event.event_type,
        func.count(Event.id).label('count')
    ).filter(
        Event.user_id == user_id,
        Event.created_at >= thirty_days_ago
    ).group_by(
        func.date(Event.created_at),
        Event.event_type
    ).all()
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {
            'date': event[0].strftime('%Y-%m-%d'),
            'event_type': event[1],
            'count': event[2]
        }
        for event in events
    ])
    
    # Create heatmap
    pivot_df = df.pivot(index='event_type', columns='date', values='count').fillna(0)
    
    fig = go.Figure(data=go.Heatmap(
        z=pivot_df.values,
        x=pivot_df.columns,
        y=pivot_df.index,
        colorscale='Viridis'
    ))
    
    fig.update_layout(
        title='User Activity Heatmap',
        xaxis_title='Date',
        yaxis_title='Event Type'
    )
    
    return jsonify({
        'plot': create_plotly_figure(fig)
    }) 