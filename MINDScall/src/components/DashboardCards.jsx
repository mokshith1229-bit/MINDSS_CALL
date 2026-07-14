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
    <Grid container spacing={2.5} disableEqualOverflow sx={{ width: '100%', mx: 0, mb: 3 }}>
      {dynamicStats.map((stat) => {
        const IconComponent = iconMap[stat.icon] || LightbulbIcon;
        const isUp = stat.trend === 'up';
        return (
          <Grid item xs={12} sm={6} lg={3} key={stat.id}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  borderColor: '#D1D5DB',
                },
                // Colored top accent bar
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  backgroundColor: stat.color,
                  borderRadius: '12px 12px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: '#9CA3AF',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        fontSize: '0.6875rem',
                        display: 'block',
                        mb: 1.25,
                      }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: '#111827',
                        fontSize: '2rem',
                        lineHeight: 1,
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: stat.bg,
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  >
                    <IconComponent sx={{ color: stat.color, fontSize: 22 }} />
                  </Avatar>
                </Box>

                {/* Trend indicator */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                  {isUp ? (
                    <TrendUpIcon sx={{ color: '#2E7D32', fontSize: 14 }} />
                  ) : (
                    <TrendDownIcon sx={{ color: '#DC2626', fontSize: 14 }} />
                  )}
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: isUp ? '#2E7D32' : '#DC2626',
                      fontSize: '0.75rem',
                    }}
                  >
                    {stat.change}
                  </Typography>
                  <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
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
