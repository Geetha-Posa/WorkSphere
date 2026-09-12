import { User, Task } from './types';


export const INITIAL_TASKS: Task[] = [
  {
    id: 't-101',
    title: 'Migrate legacy auth tokens to session store',
    status: 'pending review',
    assignedTo: 'u-emp-1', // Alex Rivera
    team: 'Engineering',
  },
  {
    id: 't-102',
    title: 'Optimize database indexes for audit log queries',
    status: 'resolved',
    assignedTo: 'u-emp-2', // Elena Rostova
    team: 'Engineering',
  },
  {
    id: 't-103',
    title: 'Patch vulnerability in internal RPC proxy',
    status: 'unassigned',
    assignedTo: '',
    team: 'Engineering',
  },
  {
    id: 't-104',
    title: 'Design high-fidelity wireframes for user profile modal',
    status: 'pending review',
    assignedTo: 'u-emp-3', // Jordan Taylor
    team: 'Design',
  },
  {
    id: 't-105',
    title: 'Audit color contrast across all form controls',
    status: 'resolved',
    assignedTo: 'u-emp-4', // Priya Patel
    team: 'Design',
  },
  {
    id: 't-106',
    title: 'Create icon set for export workflows',
    status: 'unassigned',
    assignedTo: '',
    team: 'Design',
  },
  {
    id: 't-107',
    title: 'Implement unit tests for queue worker error handling',
    status: 'pending review',
    assignedTo: 'u-emp-1', // Alex Rivera
    team: 'Engineering',
  },
];
