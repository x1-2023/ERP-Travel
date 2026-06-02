/**
 * Maternity and Sick Leave Benefits Module
 * Per Luật Bảo hiểm xã hội 2014 (Social Insurance Law 2014)
 */

/**
 * Maternity benefit rates
 */
const MATERNITY_RATES = {
  monthlyRate: 1.0, // 100% of average salary
};

/**
 * Sick leave benefit rates based on years contributed
 */
const SICK_LEAVE_RATES = {
  lessThan3Years: 0.6, // 60% of average salary
  from3To5Years: 0.7, // 70% of average salary
  from5To10Years: 0.75, // 75% of average salary
  from10To15Years: 0.8, // 80% of average salary
  from15To20Years: 0.85, // 85% of average salary
  moreThan20Years: 0.9, // 90% of average salary
};

/**
 * Get sick leave benefit rate based on years of contribution
 */
function getSickLeaveRate(yearsContributed: number): number {
  if (yearsContributed < 3) {
    return SICK_LEAVE_RATES.lessThan3Years;
  } else if (yearsContributed < 5) {
    return SICK_LEAVE_RATES.from3To5Years;
  } else if (yearsContributed < 10) {
    return SICK_LEAVE_RATES.from5To10Years;
  } else if (yearsContributed < 15) {
    return SICK_LEAVE_RATES.from10To15Years;
  } else if (yearsContributed < 20) {
    return SICK_LEAVE_RATES.from15To20Years;
  } else {
    return SICK_LEAVE_RATES.moreThan20Years;
  }
}

/**
 * Calculate maternity benefit
 * Per Luật BHXH 2014 - Phụ nữ mang thai được hưởng chế độ BHXH
 *
 * @param averageSalary - Average salary over 12 months before maternity (VNĐ)
 * @param months - Duration of maternity leave (typically 4-6 months)
 * @returns Total maternity benefit amount in VNĐ
 */
export function calculateMaternityBenefit(
  averageSalary: number,
  months: number = 4
): number {
  if (averageSalary < 0) {
    throw new Error("Average salary must be non-negative");
  }

  if (months < 1 || months > 12) {
    throw new Error("Maternity months should be between 1 and 12");
  }

  const monthlyBenefit = Math.round(
    averageSalary * MATERNITY_RATES.monthlyRate
  );
  const totalBenefit = monthlyBenefit * months;

  return totalBenefit;
}

/**
 * Maternity benefit calculation result
 */
export interface MaternityBenefitCalculation {
  averageSalary: number;
  monthlyBenefit: number;
  months: number;
  totalBenefit: number;
}

/**
 * Calculate maternity benefit with details
 */
export function calculateMaternityBenefitDetailed(
  averageSalary: number,
  months: number = 4
): MaternityBenefitCalculation {
  if (averageSalary < 0) {
    throw new Error("Average salary must be non-negative");
  }

  if (months < 1 || months > 12) {
    throw new Error("Maternity months should be between 1 and 12");
  }

  const monthlyBenefit = Math.round(
    averageSalary * MATERNITY_RATES.monthlyRate
  );
  const totalBenefit = monthlyBenefit * months;

  return {
    averageSalary,
    monthlyBenefit,
    months,
    totalBenefit,
  };
}

/**
 * Sick leave benefit calculation result
 */
export interface SickLeaveBenefitCalculation {
  salary: number;
  days: number;
  yearsContributed: number;
  benefitRate: number; // percentage
  dailyBenefit: number;
  totalBenefit: number;
}

/**
 * Calculate sick leave benefit
 * Per Luật BHXH 2014 - Chế độ hưởng trợ cấp ốm đau
 *
 * @param salary - Daily salary in VNĐ
 * @param days - Number of sick leave days
 * @param yearsContributed - Years of insurance contribution
 * @returns Total sick leave benefit in VNĐ
 */
export function calculateSickLeaveBenefit(
  salary: number,
  days: number,
  yearsContributed: number
): number {
  if (salary < 0) {
    throw new Error("Salary must be non-negative");
  }

  if (days < 0) {
    throw new Error("Days must be non-negative");
  }

  if (yearsContributed < 0) {
    throw new Error("Years contributed must be non-negative");
  }

  const rate = getSickLeaveRate(yearsContributed);
  const dailyBenefit = Math.round(salary * rate);
  const totalBenefit = dailyBenefit * days;

  return totalBenefit;
}

/**
 * Calculate sick leave benefit with details
 */
export function calculateSickLeaveBenefitDetailed(
  salary: number,
  days: number,
  yearsContributed: number
): SickLeaveBenefitCalculation {
  if (salary < 0) {
    throw new Error("Salary must be non-negative");
  }

  if (days < 0) {
    throw new Error("Days must be non-negative");
  }

  if (yearsContributed < 0) {
    throw new Error("Years contributed must be non-negative");
  }

  const rate = getSickLeaveRate(yearsContributed);
  const benefitPercentage = rate * 100;
  const dailyBenefit = Math.round(salary * rate);
  const totalBenefit = dailyBenefit * days;

  return {
    salary,
    days,
    yearsContributed,
    benefitRate: benefitPercentage,
    dailyBenefit,
    totalBenefit,
  };
}

/**
 * Calculate monthly salary from daily salary
 * Vietnamese labor law: 30 working days per month
 */
export function calculateMonthlySalaryFromDaily(
  dailySalary: number,
  workingDaysPerMonth: number = 30
): number {
  if (dailySalary < 0) {
    throw new Error("Daily salary must be non-negative");
  }

  return Math.round(dailySalary * workingDaysPerMonth);
}

/**
 * Calculate daily salary from monthly salary
 * Vietnamese labor law: 30 working days per month
 */
export function calculateDailySalaryFromMonthly(
  monthlySalary: number,
  workingDaysPerMonth: number = 30
): number {
  if (monthlySalary < 0) {
    throw new Error("Monthly salary must be non-negative");
  }

  return Math.round(monthlySalary / workingDaysPerMonth);
}

/**
 * Calculate cumulative benefits
 * Sum of maternity and sick leave benefits
 */
export interface CumulativeBenefits {
  maternity: number;
  sickLeave: number;
  total: number;
}

/**
 * Calculate total benefits over a period
 */
export function calculateCumulativeBenefits(
  averageSalary: number,
  maternityMonths: number,
  dailySalary: number,
  sickLeaveDays: number,
  yearsContributed: number
): CumulativeBenefits {
  const maternityBenefit = calculateMaternityBenefit(
    averageSalary,
    maternityMonths
  );
  const sickLeaveBenefit = calculateSickLeaveBenefit(
    dailySalary,
    sickLeaveDays,
    yearsContributed
  );

  return {
    maternity: maternityBenefit,
    sickLeave: sickLeaveBenefit,
    total: maternityBenefit + sickLeaveBenefit,
  };
}

/**
 * Get benefit rate description
 */
export function getBenefitRateDescription(
  yearsContributed: number
): {
  rate: number;
  description: string;
} {
  if (yearsContributed < 3) {
    return {
      rate: SICK_LEAVE_RATES.lessThan3Years * 100,
      description: "Less than 3 years: 60% of salary",
    };
  } else if (yearsContributed < 5) {
    return {
      rate: SICK_LEAVE_RATES.from3To5Years * 100,
      description: "3-5 years: 70% of salary",
    };
  } else if (yearsContributed < 10) {
    return {
      rate: SICK_LEAVE_RATES.from5To10Years * 100,
      description: "5-10 years: 75% of salary",
    };
  } else if (yearsContributed < 15) {
    return {
      rate: SICK_LEAVE_RATES.from10To15Years * 100,
      description: "10-15 years: 80% of salary",
    };
  } else if (yearsContributed < 20) {
    return {
      rate: SICK_LEAVE_RATES.from15To20Years * 100,
      description: "15-20 years: 85% of salary",
    };
  } else {
    return {
      rate: SICK_LEAVE_RATES.moreThan20Years * 100,
      description: "20+ years: 90% of salary",
    };
  }
}

export default {
  calculateMaternityBenefit,
  calculateMaternityBenefitDetailed,
  calculateSickLeaveBenefit,
  calculateSickLeaveBenefitDetailed,
  calculateMonthlySalaryFromDaily,
  calculateDailySalaryFromMonthly,
  calculateCumulativeBenefits,
  getBenefitRateDescription,
};
