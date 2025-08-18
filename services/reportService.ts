// src/services/reportService.ts

import api from '../api'; // Your pre-configured Axios instance
import { Report } from '../types';

/**
 * Fetches all billboards for the currently logged-in user.
 */
export const getMyBillboards = async (): Promise<Report[]> => {
    const response = await api.get('/my-billboards');
    return response.data;
};

/**
 * Fetches a single report by its unique ID.
 * This is the function your ReportPage is missing.
 */
export const getReportById = async (id: string): Promise<Report> => {
    const response = await api.get(`/billboards/${id}`);
    return response.data;
};

/**
 * Updates the status of a specific report.
 * This is for your "Submit to Municipality" button.
 */
export const updateReportStatus = async (id: string, status: 'Reported'): Promise<Report> => {
    const response = await api.patch(`/billboards/${id}/status`, { status });
    return response.data;
};