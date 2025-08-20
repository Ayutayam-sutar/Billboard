// src/services/reportService.ts
import api from '../api';
import { Report } from '../types';

// This now fetches ALL reports from your live backend
export const fetchMyReports = async (): Promise<Report[]> => {
  try {
    const response = await api.get('/my-billboards');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return [];
  }
};

// This now fetches a SINGLE report from your live backend
export const getReportById = async (reportId: string): Promise<Report | null> => {
  try {
    const response = await api.get(`/my-billboards/${reportId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch report with id ${reportId}:`, error);
    return null;
  }
};

// This now updates a report's status on your live backend
export const updateReportStatus = async (reportId: string, status: string): Promise<Report | null> => {
  try {
    const response = await api.patch(`/my-billboards/${reportId}`, { status });
    return response.data;
  } catch (error) {
    console.error(`Failed to update status for report ${reportId}:`, error);
    return null;
  }
};