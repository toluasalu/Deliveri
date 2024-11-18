import { api } from '~/config/axios';

export const updatePatrolTrack = ({
  patrolId,
  latitude,
  longitude,
  serialNumber,
}: {
  patrolId: string;
  latitude: number;
  longitude: number;
  serialNumber: number | string;
}) => {
  return api.post(
    '/update_patrolling_track',
    {
      patrolling_id: patrolId,
      latitude,
      longitude,
      serialNo: serialNumber,
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  ).then((response) => {
    // Log the entire response object to inspect what is returned
    console.log('Axios response:', response);

    // You can also log specific parts of the response:
    console.log('Response data:', response.data);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    return response;  // Return the response if you need to use it elsewhere
  })
    .catch((error) => {
      // Log the error if the request fails
      console.error('Axios error:', error);

      // If you need to access error response details, you can log it here as well:
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        console.log('Error response headers:', error.response.headers);
      }

      throw error;  // Rethrow the error for further handling
    });
};

export const createPatrol = ({ patrolling_name }: { patrolling_name: string }) => {
  return api.post(
    '/start_patrolling',
    {
      patrolling_name,
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};
