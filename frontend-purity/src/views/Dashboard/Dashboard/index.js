// Chakra imports
import {
  Flex,
  Grid,
  Image,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from "@chakra-ui/react";
// assets
import peopleImage from "assets/img/people-image.png";
import logoChakra from "assets/svg/logo-white.svg";
import BarChart from "components/Charts/BarChart";
import LineChart from "components/Charts/LineChart";
// Custom icons
import {
  CartIcon,
  DocumentIcon,
  GlobeIcon,
  WalletIcon,
} from "components/Icons/Icons.js";
import React, { useState, useEffect } from "react";
import { dashboardTableData, timelineData } from "variables/general";
import ActiveUsers from "./components/ActiveUsers";
import BuiltByDevelopers from "./components/BuiltByDevelopers";
import MiniStatistics from "./components/MiniStatistics";
import OrdersOverview from "./components/OrdersOverview";
import Projects from "./components/Projects";
import SalesOverview from "./components/SalesOverview";
import WorkWithTheRockets from "./components/WorkWithTheRockets";
import eventsService from "services/events.service";

export default function Dashboard() {
  const iconBoxInside = useColorModeValue("white", "white");

  const [dates, setDates] = useState([]);
  const [dailyCreateCount, setDailyCreateCount] = useState([]);
  const [dailyUpdateCount, setDailyUpdateCount] = useState([]);
  const [dailyDeleteCount, setDailyDeleteCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDailyCounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await eventsService.getDailyCounts({ days: 30 });
        setDates(response?.dates || []);
        setDailyCreateCount(response?.counts?.create || []);
        setDailyUpdateCount(response?.counts?.update || []);
        setDailyDeleteCount(response?.counts?.delete || []);
      } catch (error) {
        setError(error.message || 'Failed to fetch event data');
      } finally {
        setLoading(false);
      }
    };

    fetchDailyCounts();
  }, []);

  if (loading) {
    return (
      <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }} alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading dashboard data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Flex>
    );
  }

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      {/* <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
        <MiniStatistics
          title={"Today's Moneys"}
          amount={"$53,000"}
          percentage={55}
          icon={<WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Today's Users"}
          amount={"2,300"}
          percentage={5}
          icon={<GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"New Clients"}
          amount={"+3,020"}
          percentage={-14}
          icon={<DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Total Sales"}
          amount={"$173,000"}
          percentage={8}
          icon={<CartIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
      </SimpleGrid> */}
      {/* <Grid
        templateColumns={{ md: "1fr", lg: "1.8fr 1.2fr" }}
        templateRows={{ md: "1fr auto", lg: "1fr" }}
        my='26px'
        gap='24px'>
        <BuiltByDevelopers
          title={"Built by Developers"}
          name={"Purity UI Dashboard"}
          description={
            "From colors, cards, typography to complex elements, you will find the full documentation."
          }
          image={
            <Image
              src={logoChakra}
              alt='chakra image'
              minWidth={{ md: "300px", lg: "auto" }}
            />
          }
        />
        <WorkWithTheRockets
          backgroundImage={peopleImage}
          title={"Work with the rockets"}
          description={
            "Wealth creation is a revolutionary recent positive-sum game. It is all about who takes the opportunity first."
          }
        />
      </Grid> */}
      {dailyCreateCount?.length > 0 && (
        <Grid
          templateColumns={{ sm: "1fr" }}
          templateRows={{ sm: "1fr" }}
          gap='24px'
          mb={{ lg: "26px" }}>
          {/* <ActiveUsers
            title={"Create Events"}
            percentage={23}
            chart={<BarChart chartData={dailyCreateCount} dates={dates} />}
          /> */}
          <SalesOverview
            title={"Create Events Overview"}
            percentage={5}
            chart={<LineChart chartData={dailyCreateCount} dates={dates} />}
          />
        </Grid>
      )}
      {dailyUpdateCount?.length > 0 && (
        <Grid
          templateColumns={{ sm: "1fr" }}
          templateRows={{ sm: "1fr" }}
          gap='24px'
          mb={{ lg: "26px" }}>
          {/* <ActiveUsers
            title={"Update Events"}
            percentage={23}
            chart={<BarChart chartData={dailyUpdateCount} dates={dates} />}
          /> */}
          <SalesOverview
            title={"Update Events Overview"}
            percentage={5}
            chart={<LineChart chartData={dailyUpdateCount} dates={dates} />}
          />
        </Grid>
      )}
      {dailyDeleteCount?.length > 0 && (
        <Grid
          templateColumns={{ sm: "1fr" }}
          templateRows={{ sm: "1fr" }}
          gap='24px'
          mb={{ lg: "26px" }}>
          {/* <ActiveUsers
            title={"Delete Events"}
            percentage={23}
            chart={<BarChart chartData={dailyDeleteCount} dates={dates} />}
          /> */}
          <SalesOverview
            title={"Delete Events Overview"}
            percentage={5}
            chart={<LineChart chartData={dailyDeleteCount} dates={dates} />}
          />
        </Grid>
      )}
      {!dailyCreateCount?.length && !dailyUpdateCount?.length && !dailyDeleteCount?.length && !loading && !error && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <AlertTitle>No event data available</AlertTitle>
          <AlertDescription>There are no events recorded in the last 30 days.</AlertDescription>
        </Alert>
      )}
      {/* <Grid
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        templateRows={{ sm: "1fr auto", md: "1fr", lg: "1fr" }}
        gap='24px'>
        <Projects
          title={"Projects"}
          amount={30}
          captions={["Companies", "Members", "Budget", "Completion"]}
          data={dashboardTableData}
        />
        <OrdersOverview
          title={"Orders Overview"}
          amount={30}
          data={timelineData}
        />
      </Grid> */}
    </Flex>
  );
}
