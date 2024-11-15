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
  );
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
