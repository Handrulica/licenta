import { ethers } from 'ethers';
import cron from 'node-cron';
import { env } from "./env";
import { prisma } from './prisma';


export const handlePayments = async (contract: ethers.Contract) => {
  cron.schedule('0 0 * * *', () => {

  });
} 