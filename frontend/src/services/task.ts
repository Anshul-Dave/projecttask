import { makeApiCall } from '@/src/config/apiconfig';

export const taskService = {
  getTasksByListId: async (listId: string | number) => {
    return await makeApiCall('GET', `/lists/${listId}/tasks`);
  },

  getTaskById: async (taskId: string | number) => {
    return await makeApiCall('GET', `/tasks/${taskId}`);
  },

  createTask: async (listId: string | number, taskData: any) => {
    return await makeApiCall('POST', `/tasks`, { listId, task: taskData });
  },

  //edit
  updateTask: async (taskId: string | number, taskData: any) => {
    return await makeApiCall('PUT', `/tasks/${taskId}`, taskData);
  },

  deleteTask: async (taskId: string | number) => {
    return await makeApiCall('DELETE', `/tasks/${taskId}`);
  },

  moveTask: async (taskId: string | number, moveData: { sourceListId: string | number; destinationListId: string | number; newIndex: number }) => {
    return await makeApiCall('POST', `/tasks/${taskId}/move`, moveData);
  }
};
