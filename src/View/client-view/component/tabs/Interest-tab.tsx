import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Descriptions, Avatar, Button } from 'antd';
import type { DescriptionsProps } from 'antd';
import { useAppSelector } from '@slices/store';


const InterestTab: React.FC = () => {
  const clientInfo = useAppSelector((state) => state.clients);
  const client = clientInfo?.selectedClient;

  const clientDetails: DescriptionsProps['items'] = [
    {
      key: '1',
      label: 'About Me',
      children: client?.aboutMe ? (
        <Typography
          dangerouslySetInnerHTML={{
            __html: client.aboutMe,
          }}
        />
      ) : 'N/A',
    },
    {
      key: '2',
      label: 'Interest',
      children: client?.interests ? (
        <Typography
          dangerouslySetInnerHTML={{
            __html: client.interests,
          }}
        />
      ) : 'N/A',
    },
    {
      key: '3',
      label: 'Dislikes',
      children: client?.dislikes ? (
        <Typography
          dangerouslySetInnerHTML={{
            __html: client.dislikes,
          }}
        />
      ) : 'N/A',
    },
    
  ];

  return (
    <Stack
      width="100%"
      height="100%"
      sx={{ border: '2px solid green', padding: '16px' }}
      spacing={4}
    >
      <Descriptions
        bordered
        items={clientDetails}
        column={1}
        layout='vertical'
        size="small"
        style={{ width: '100%' }}
      />
    </Stack>
  );
};

export default InterestTab;
