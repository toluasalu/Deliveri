import { useMutation } from '@tanstack/react-query';

import { createPatrol, updatePatrolTrack } from './api';

export function useCreatePatrol() {
  return useMutation({
    mutationFn: createPatrol,
  });
}

export function useUpdatePatrolTrack() {
  return useMutation({
    mutationFn: updatePatrolTrack,
  });
}
