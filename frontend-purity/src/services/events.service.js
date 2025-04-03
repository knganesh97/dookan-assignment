import api from './api';

const eventsService = {
  getUserEvents: async (params) => {
    const queryParams = {
      ...(params.user_id && { user_id: params.user_id }),
      ...(params.event_type && { event_type: params.event_type }),
      ...(params.start_date && { start_date: params.start_date }),
      ...(params.end_date && { end_date: params.end_date }),
      page: params.page || 1,
      per_page: params.per_page || 20
    };
    
    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await api.get(`/events?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getUsersList: async () => {
    try {
      const response = await api.get('/events/users');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getDailyCounts: async (params) => {
    const queryParams = {
      ...(params.days && { days: params.days })
    };

    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await api.get(`/events/daily-counts?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default eventsService;