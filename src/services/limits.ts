import { PlanType } from './billing';

export interface PlanLimits {
  maxProperties: number;
  maxRooms: number;
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  basic: {
    maxProperties: 1,
    maxRooms: 10,
  },
  pro: {
    maxProperties: 5,
    maxRooms: 100,
  },
  enterprise: {
    maxProperties: Infinity,
    maxRooms: Infinity,
  },
};

export const getPlanLimits = (plan: PlanType): PlanLimits => {
  return PLAN_LIMITS[plan];
};

export const canAddProperty = (currentCount: number, plan: PlanType): boolean => {
  const limits = getPlanLimits(plan);
  return currentCount < limits.maxProperties;
};

export const canAddRoom = (currentCount: number, plan: PlanType): boolean => {
  const limits = getPlanLimits(plan);
  return currentCount < limits.maxRooms;
};

export const getLimitMessage = (type: 'property' | 'room', plan: PlanType): string => {
  const limits = getPlanLimits(plan);
  
  if (type === 'property') {
    return `Vous avez atteint la limite de ${limits.maxProperties} propriété(s) pour le plan ${plan.toUpperCase()}`;
  }
  
  return `Vous avez atteint la limite de ${limits.maxRooms} chambres pour le plan ${plan.toUpperCase()}`;
};
