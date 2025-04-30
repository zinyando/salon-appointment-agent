import { Mastra } from '@mastra/core';
import { salonBookingAgent } from './agents/salon-booking-agent';

export const mastra = new Mastra({
  agents: { salonBookingAgent },
});
