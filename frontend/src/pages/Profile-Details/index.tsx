import {
  Avatar,
  Box,
  Card,
  CardHeader,
  Container,
  Grid,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { useAppSelector } from '../../redux/store';
import OrderDetailsPage from '../myorders.page';
import UpdateMePage from './update-me.page';
import UpdatePasswordPage from './update-password.page';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CustomTab = styled(Tab)({
  '&.MuiTab-root': {
    alignItems: 'flex-start',
  },
  '&.Mui-selected': {
    backgroundColor: ' #d2e6f9',
    color: '#0e4071',
  },
});

const ProfileDetailsPage = () => {
  const [value, setValue] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const user = useAppSelector((state) => state.authUser.user);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const onImageLoaded = () => {
    setImageLoading(false);
  };

  return (
    <Container maxWidth='lg'>
      <Grid container>
        <Grid item md={4}>
          <Card>
            <CardHeader
              avatar={
                <>
                  <Avatar
                    imgProps={{
                      onLoad: onImageLoaded,
                    }}
                    alt={user?.name}
                    src={
                      user && !user?.photo.includes('default')
                        ? user?.photo
                        : `/api/static/users/default.png`
                    }
                    aria-label='User profile'
                    sx={{
                      width: 65,
                      height: 65,
                    }}
                    style={{ display: imageLoading ? 'none' : 'block' }}
                  ></Avatar>
                  <Skeleton
                    variant='circular'
                    animation='wave'
                    height='65px'
                    width='65px'
                    style={{ display: imageLoading ? 'block' : 'none' }}
                  />
                </>
              }
              title={
                <Typography variant='h6'>{user?.role.toUpperCase()}</Typography>
              }
              subtitle={user && user.createdAt}
            />
            <Tabs
              orientation='vertical'
              variant='fullWidth'
              value={value}
              onChange={handleChange}
              aria-label='E-commerce website profile vertical tabs'
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              {user &&
                !user.provider && [
                  <CustomTab
                    key={Math.random() * 3}
                    label='Profile Settings'
                    {...a11yProps(0)}
                  />,
                  <CustomTab
                    key={Math.random() * 5}
                    label='Update Password'
                    {...a11yProps(1)}
                  />,
                ]}
              <CustomTab
                label='Orders'
                {...a11yProps(user && user.provider ? 0 : 2)}
              />
            </Tabs>
          </Card>
        </Grid>
        <Grid item md={8}>
          {user && !user.provider && (
            <>
              <TabPanel value={value} index={0}>
                <UpdateMePage />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <UpdatePasswordPage />
              </TabPanel>
            </>
          )}
          <TabPanel value={value} index={user && user.provider ? 0 : 2}>
            <OrderDetailsPage />
          </TabPanel>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfileDetailsPage;
