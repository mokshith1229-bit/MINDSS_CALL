import React from 'react';
import {
  Grid, Card, CardContent, Box, Typography, Avatar,
} from '@mui/material';
import {
  LightbulbOutlined as LightbulbIcon,
  DescriptionOutlined as DescIcon,
  HourglassEmptyOutlined as HourglassIcon,
  CheckCircleOutlined as CheckIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  ListAltOutlined as ListAltIcon,
} from '@mui/icons-material';
const iconMap = {
  Lightbulb: LightbulbIcon,
  Description: DescIcon,
  HourglassEmpty: HourglassIcon,
  CheckCircle: CheckIcon,
  ListAlt: ListAltIcon,
  TrendingUp: TrendUpIcon,
};

const DashboardCards = ({ dynamicStats = [] }) => {
  return (
    <Grid container spacing={3}>
      {dynamicStats.map((stat) => {
        const IconComponent = iconMap[stat.icon] || LightbulbIcon;
        const isUp = stat.trend === 'up';
        return (
          <Grid xs={12} sm={6} lg={3} key={stat.id}>
            <Card
              sx={{
                borderRadius: 3,
                p: 0.5,
                position: 'relative',
                overflow: 'visible',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  borderRadius: '16px 16px 0 0',
                  backgroundColor: stat.color,
                },
              }}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#78909C',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.72rem',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: '#212121', lineHeight: 1 }}
                    >
                      {stat.value.toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: stat.bg,
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                    }}
                  >
                    <IconComponent sx={{ color: stat.color, fontSize: 26 }} />
                  </Avatar>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                  {isUp ? (
                    <TrendUpIcon sx={{ color: '#2E7D32', fontSize: 16 }} />
                  ) : (
                    <TrendDownIcon sx={{ color: '#C62828', fontSize: 16 }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: isUp ? '#2E7D32' : '#C62828',
                      fontSize: '0.8rem',
                    }}
                  >
                    {stat.change}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.78rem' }}>
                    vs last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default DashboardCards;
