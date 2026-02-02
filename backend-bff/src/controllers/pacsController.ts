import { Request, Response } from 'express';
import { OrthancService } from '../services/orthancService';

export const getPacsInfo = async (req: Request, res: Response) => {
    try {
        const info = await OrthancService.getSystemInfo();
        res.status(200).json({
            status: 'success',
            data: info
        });
    } catch (error: any) {
        res.status(503).json({
            status: 'error',
            message: error.message
        });
    }
};

export const getPatients = async (req: Request, res: Response) => {
    try {
        const patients = await OrthancService.getAllPatients();
        res.status(200).json({
            status: 'success',
            results: patients.length,
            data: patients
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};