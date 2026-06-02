import { z } from 'zod';
/**
 * EmployeeOnboarded - Nhân viên được tuyển dụng/bắt đầu
 * Kích hoạt: HR xác nhận nhân viên chính thức
 */
export declare const EmployeeOnboardedSchema: z.ZodObject<{
    employeeId: z.ZodString;
    employeeNumber: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    department: z.ZodString;
    position: z.ZodString;
    supervisor: z.ZodOptional<z.ZodString>;
    hireDate: z.ZodString;
    employmentType: z.ZodEnum<["full_time", "part_time", "contract", "intern"]>;
    baseSalary: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    costCenter: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    personalIdentification: z.ZodOptional<z.ZodString>;
    bankAccount: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
    emergencyContact: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    email: string;
    employeeId: string;
    department: string;
    position: string;
    baseSalary: number;
    hireDate: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    employmentType: "contract" | "full_time" | "part_time" | "intern";
    notes?: string | undefined;
    phone?: string | undefined;
    bankAccount?: string | undefined;
    address?: string | undefined;
    costCenter?: string | undefined;
    supervisor?: string | undefined;
    personalIdentification?: string | undefined;
    taxId?: string | undefined;
    emergencyContact?: string | undefined;
}, {
    email: string;
    employeeId: string;
    department: string;
    position: string;
    baseSalary: number;
    hireDate: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    employmentType: "contract" | "full_time" | "part_time" | "intern";
    currency?: string | undefined;
    notes?: string | undefined;
    phone?: string | undefined;
    bankAccount?: string | undefined;
    address?: string | undefined;
    costCenter?: string | undefined;
    supervisor?: string | undefined;
    personalIdentification?: string | undefined;
    taxId?: string | undefined;
    emergencyContact?: string | undefined;
}>;
export type EmployeeOnboarded = z.infer<typeof EmployeeOnboardedSchema>;
/**
 * LeaveRequested - Yêu cầu phép được tạo
 * Kích hoạt: Nhân viên đệ trình đơn xin phép
 */
export declare const LeaveRequestedSchema: z.ZodObject<{
    leaveRequestId: z.ZodString;
    employeeId: z.ZodString;
    employeeName: z.ZodString;
    leaveType: z.ZodEnum<["annual", "sick", "unpaid", "maternity", "paternity", "bereavement", "other"]>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    numberOfDays: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["pending", "approved", "rejected"]>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    submittedDate: z.ZodString;
    supervisor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "approved" | "rejected";
    employeeId: string;
    startDate: string;
    endDate: string;
    leaveRequestId: string;
    employeeName: string;
    leaveType: "other" | "annual" | "sick" | "unpaid" | "maternity" | "paternity" | "bereavement";
    numberOfDays: number;
    submittedDate: string;
    reason?: string | undefined;
    supervisor?: string | undefined;
    attachments?: string[] | undefined;
}, {
    employeeId: string;
    startDate: string;
    endDate: string;
    leaveRequestId: string;
    employeeName: string;
    leaveType: "other" | "annual" | "sick" | "unpaid" | "maternity" | "paternity" | "bereavement";
    numberOfDays: number;
    submittedDate: string;
    status?: "pending" | "approved" | "rejected" | undefined;
    reason?: string | undefined;
    supervisor?: string | undefined;
    attachments?: string[] | undefined;
}>;
export type LeaveRequested = z.infer<typeof LeaveRequestedSchema>;
/**
 * LeaveApproved - Phép được phê duyệt
 * Kích hoạt: Manager/HR phê duyệt đơn phép
 */
export declare const LeaveApprovedSchema: z.ZodObject<{
    leaveRequestId: z.ZodString;
    leaveApprovalId: z.ZodString;
    employeeId: z.ZodString;
    employeeName: z.ZodString;
    leaveType: z.ZodEnum<["annual", "sick", "unpaid", "maternity", "paternity", "bereavement", "other"]>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    numberOfDays: z.ZodNumber;
    approvedBy: z.ZodString;
    approvedDate: z.ZodString;
    approvalNotes: z.ZodOptional<z.ZodString>;
    balanceRemaining: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    approvedBy: string;
    startDate: string;
    endDate: string;
    approvedDate: string;
    leaveRequestId: string;
    employeeName: string;
    leaveType: "other" | "annual" | "sick" | "unpaid" | "maternity" | "paternity" | "bereavement";
    numberOfDays: number;
    leaveApprovalId: string;
    approvalNotes?: string | undefined;
    balanceRemaining?: number | undefined;
}, {
    employeeId: string;
    approvedBy: string;
    startDate: string;
    endDate: string;
    approvedDate: string;
    leaveRequestId: string;
    employeeName: string;
    leaveType: "other" | "annual" | "sick" | "unpaid" | "maternity" | "paternity" | "bereavement";
    numberOfDays: number;
    leaveApprovalId: string;
    approvalNotes?: string | undefined;
    balanceRemaining?: number | undefined;
}>;
export type LeaveApproved = z.infer<typeof LeaveApprovedSchema>;
/**
 * PayrollProcessed - Tính lương được xử lý
 * Kích hoạt: HR chạy tính lương tháng
 * Flow: Trigger JournalEntryPosted (salary expense entries)
 */
export declare const PayrollProcessedSchema: z.ZodObject<{
    payrollId: z.ZodString;
    payrollNumber: z.ZodString;
    payrollPeriod: z.ZodObject<{
        startDate: z.ZodString;
        endDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startDate: string;
        endDate: string;
    }, {
        startDate: string;
        endDate: string;
    }>;
    processedDate: z.ZodString;
    paymentDate: z.ZodOptional<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
    employees: z.ZodArray<z.ZodObject<{
        employeeId: z.ZodString;
        employeeNumber: z.ZodString;
        employeeName: z.ZodString;
        baseSalary: z.ZodNumber;
        grossSalary: z.ZodNumber;
        incomeTax: z.ZodNumber;
        socialInsurance: z.ZodNumber;
        healthInsurance: z.ZodNumber;
        unemploymentInsurance: z.ZodNumber;
        otherDeductions: z.ZodOptional<z.ZodNumber>;
        netSalary: z.ZodNumber;
        department: z.ZodOptional<z.ZodString>;
        costCenter: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        employeeId: string;
        baseSalary: number;
        netSalary: number;
        employeeNumber: string;
        employeeName: string;
        grossSalary: number;
        incomeTax: number;
        socialInsurance: number;
        healthInsurance: number;
        unemploymentInsurance: number;
        department?: string | undefined;
        costCenter?: string | undefined;
        otherDeductions?: number | undefined;
    }, {
        employeeId: string;
        baseSalary: number;
        netSalary: number;
        employeeNumber: string;
        employeeName: string;
        grossSalary: number;
        incomeTax: number;
        socialInsurance: number;
        healthInsurance: number;
        unemploymentInsurance: number;
        department?: string | undefined;
        costCenter?: string | undefined;
        otherDeductions?: number | undefined;
    }>, "many">;
    totalGrossSalary: z.ZodNumber;
    totalIncomeTax: z.ZodNumber;
    totalSocialContributions: z.ZodNumber;
    totalNetSalary: z.ZodNumber;
    employerContributions: z.ZodOptional<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["draft", "processed", "approved", "paid"]>>;
    approvedBy: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    status: "processed" | "approved" | "draft" | "paid";
    payrollPeriod: {
        startDate: string;
        endDate: string;
    };
    employees: {
        employeeId: string;
        baseSalary: number;
        netSalary: number;
        employeeNumber: string;
        employeeName: string;
        grossSalary: number;
        incomeTax: number;
        socialInsurance: number;
        healthInsurance: number;
        unemploymentInsurance: number;
        department?: string | undefined;
        costCenter?: string | undefined;
        otherDeductions?: number | undefined;
    }[];
    payrollId: string;
    payrollNumber: string;
    processedDate: string;
    totalGrossSalary: number;
    totalIncomeTax: number;
    totalSocialContributions: number;
    totalNetSalary: number;
    approvedBy?: string | undefined;
    notes?: string | undefined;
    paymentDate?: string | undefined;
    employerContributions?: number | undefined;
}, {
    payrollPeriod: {
        startDate: string;
        endDate: string;
    };
    employees: {
        employeeId: string;
        baseSalary: number;
        netSalary: number;
        employeeNumber: string;
        employeeName: string;
        grossSalary: number;
        incomeTax: number;
        socialInsurance: number;
        healthInsurance: number;
        unemploymentInsurance: number;
        department?: string | undefined;
        costCenter?: string | undefined;
        otherDeductions?: number | undefined;
    }[];
    payrollId: string;
    payrollNumber: string;
    processedDate: string;
    totalGrossSalary: number;
    totalIncomeTax: number;
    totalSocialContributions: number;
    totalNetSalary: number;
    currency?: string | undefined;
    status?: "processed" | "approved" | "draft" | "paid" | undefined;
    approvedBy?: string | undefined;
    notes?: string | undefined;
    paymentDate?: string | undefined;
    employerContributions?: number | undefined;
}>;
export type PayrollProcessed = z.infer<typeof PayrollProcessedSchema>;
/**
 * AttendanceRecorded - Chấm công được ghi nhập
 * Kích hoạt: Hệ thống chấm công, biometric, hoặc manual entry
 */
export declare const AttendanceRecordedSchema: z.ZodObject<{
    attendanceId: z.ZodString;
    employeeId: z.ZodString;
    employeeName: z.ZodString;
    date: z.ZodString;
    checkInTime: z.ZodOptional<z.ZodString>;
    checkOutTime: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["present", "absent", "late", "half_day", "excused"]>;
    workedHours: z.ZodOptional<z.ZodNumber>;
    overtime: z.ZodOptional<z.ZodNumber>;
    location: z.ZodOptional<z.ZodString>;
    device: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    approvedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "present" | "absent" | "late" | "half_day" | "excused";
    employeeId: string;
    date: string;
    employeeName: string;
    attendanceId: string;
    approvedBy?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
    checkInTime?: string | undefined;
    checkOutTime?: string | undefined;
    workedHours?: number | undefined;
    overtime?: number | undefined;
    device?: string | undefined;
}, {
    status: "present" | "absent" | "late" | "half_day" | "excused";
    employeeId: string;
    date: string;
    employeeName: string;
    attendanceId: string;
    approvedBy?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
    checkInTime?: string | undefined;
    checkOutTime?: string | undefined;
    workedHours?: number | undefined;
    overtime?: number | undefined;
    device?: string | undefined;
}>;
export type AttendanceRecorded = z.infer<typeof AttendanceRecordedSchema>;
/**
 * Export all HRM event schemas
 */
export declare const HRMEventSchemas: {
    readonly 'hrm.employee.onboarded': z.ZodObject<{
        employeeId: z.ZodString;
        employeeNumber: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        department: z.ZodString;
        position: z.ZodString;
        supervisor: z.ZodOptional<z.ZodString>;
        hireDate: z.ZodString;
        employmentType: z.ZodEnum<["full_time", "part_time", "contract", "intern"]>;
        baseSalary: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        costCenter: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        personalIdentification: z.ZodOptional<z.ZodString>;
        bankAccount: z.ZodOptional<z.ZodString>;
        taxId: z.ZodOptional<z.ZodString>;
        emergencyContact: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        email: string;
        employeeId: string;
        department: string;
        position: string;
        baseSalary: number;
        hireDate: string;
        firstName: string;
        lastName: string;
        employeeNumber: string;
        employmentType: "contract" | "full_time" | "part_time" | "intern";
        notes?: string | undefined;
        phone?: string | undefined;
        bankAccount?: string | undefined;
        address?: string | undefined;
        costCenter?: string | undefined;
        supervisor?: string | undefined;
        personalIdentification?: string | undefined;
        taxId?: string | undefined;
        emergencyContact?: string | undefined;
    }, {
        email: string;
        employeeId: string;
        department: string;
        position: string;
        baseSalary: number;
        hireDate: string;
        firstName: string;
        lastName: string;
        employeeNumber: string;
        employmentType: "contract" | "full_time" | "part_time" | "intern";
        currency?: string | undefined;
        notes?: string | undefined;
        phone?: string | undefined;
        bankAccount?: string | undefined;
        address?: string | undefined;
        costCenter?: string | undefined;
        supervisor?: string | undefined;
        personalIdentification?: string | undefined;
        taxId?: string | undefined;
        emergencyContact?: string | undefined;
    }>;
    readonly 'hrm.leave.requested': z.ZodObject<{
        leaveRequestId: z.ZodString;
        employeeId: z.ZodString;
        employeeName: z.ZodString;
        leaveType: z.ZodEnum<["annual", "sick", "unpaid", "maternity", "paternity", "bereavement", "other"]>;
        startDate: z.ZodString;
        endDate: z.ZodString;
        numberOfDays: z.ZodNumber;
        reason: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<["pending", "approved", "rejected"]>>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        submittedDate: z.ZodString;
        supervisor: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "approved" | "rejected";
        employeeId: string;
        startDate: string;
        endDate: string;
        leaveRequestId: string;
        employeeName: string;
        leaveType: "other" | "annual" | "sick" | "unpaid" | "maternity" | "paternity" | "bereavement";
        numberOfDays: number;
        submittedDate: string;
        reason?: string | undefined;
        supervisor?: string | undefined;
        attachments?: string[] | undefined;
    }, {
        employeeId: string;
        startDate: string;
        endDate: string;
        leaveRequestId: string;
        employeeName: string;
        leaveType: "other" | "annual" | "sick" | "unpaid" | "maternity" | "paternity" | "bereavement";
        numberOfDays: number;
        submittedDate: string;
        status?: "pending" | "approved" | "rejected" | undefined;
        reason?: string | undefined;
        supervisor?: string | undefined;
        attachments?: string[] | undefined;
    }>;
    readonly 'hrm.leave.approved': z.ZodObject<{
        leaveRequestId: z.ZodString;
        leaveApprovalId: z.ZodString;
        employeeId: z.ZodString;
        employeeName: z.ZodString;
        leaveType: z.ZodEnum<["annual", "sick", "unpaid", "maternity", "paternity", "bereavement", "other"]>;
        startDate: z.ZodString;
        endDate: z.ZodString;
        numberOfDays: z.ZodNumber;
        approvedBy: z.ZodString;
        approvedDate: z.ZodString;
        approvalNotes: z.ZodOptional<z.ZodString>;
        balanceRemaining: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        employeeId: string;
        approvedBy: string;
        startDate: string;
        endDate: string;
        approvedDate: string;
        leaveRequestId: string;
        employeeName: string;
        leaveType: "other" | "annual" | "sick" | "unpaid" | "maternity" | "paternity" | "bereavement";
        numberOfDays: number;
        leaveApprovalId: string;
        approvalNotes?: string | undefined;
        balanceRemaining?: number | undefined;
    }, {
        employeeId: string;
        approvedBy: string;
        startDate: string;
        endDate: string;
        approvedDate: string;
        leaveRequestId: string;
        employeeName: string;
        leaveType: "other" | "annual" | "sick" | "unpaid" | "maternity" | "paternity" | "bereavement";
        numberOfDays: number;
        leaveApprovalId: string;
        approvalNotes?: string | undefined;
        balanceRemaining?: number | undefined;
    }>;
    readonly 'hrm.payroll.processed': z.ZodObject<{
        payrollId: z.ZodString;
        payrollNumber: z.ZodString;
        payrollPeriod: z.ZodObject<{
            startDate: z.ZodString;
            endDate: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            startDate: string;
            endDate: string;
        }, {
            startDate: string;
            endDate: string;
        }>;
        processedDate: z.ZodString;
        paymentDate: z.ZodOptional<z.ZodString>;
        currency: z.ZodDefault<z.ZodString>;
        employees: z.ZodArray<z.ZodObject<{
            employeeId: z.ZodString;
            employeeNumber: z.ZodString;
            employeeName: z.ZodString;
            baseSalary: z.ZodNumber;
            grossSalary: z.ZodNumber;
            incomeTax: z.ZodNumber;
            socialInsurance: z.ZodNumber;
            healthInsurance: z.ZodNumber;
            unemploymentInsurance: z.ZodNumber;
            otherDeductions: z.ZodOptional<z.ZodNumber>;
            netSalary: z.ZodNumber;
            department: z.ZodOptional<z.ZodString>;
            costCenter: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            employeeId: string;
            baseSalary: number;
            netSalary: number;
            employeeNumber: string;
            employeeName: string;
            grossSalary: number;
            incomeTax: number;
            socialInsurance: number;
            healthInsurance: number;
            unemploymentInsurance: number;
            department?: string | undefined;
            costCenter?: string | undefined;
            otherDeductions?: number | undefined;
        }, {
            employeeId: string;
            baseSalary: number;
            netSalary: number;
            employeeNumber: string;
            employeeName: string;
            grossSalary: number;
            incomeTax: number;
            socialInsurance: number;
            healthInsurance: number;
            unemploymentInsurance: number;
            department?: string | undefined;
            costCenter?: string | undefined;
            otherDeductions?: number | undefined;
        }>, "many">;
        totalGrossSalary: z.ZodNumber;
        totalIncomeTax: z.ZodNumber;
        totalSocialContributions: z.ZodNumber;
        totalNetSalary: z.ZodNumber;
        employerContributions: z.ZodOptional<z.ZodNumber>;
        status: z.ZodDefault<z.ZodEnum<["draft", "processed", "approved", "paid"]>>;
        approvedBy: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        status: "processed" | "approved" | "draft" | "paid";
        payrollPeriod: {
            startDate: string;
            endDate: string;
        };
        employees: {
            employeeId: string;
            baseSalary: number;
            netSalary: number;
            employeeNumber: string;
            employeeName: string;
            grossSalary: number;
            incomeTax: number;
            socialInsurance: number;
            healthInsurance: number;
            unemploymentInsurance: number;
            department?: string | undefined;
            costCenter?: string | undefined;
            otherDeductions?: number | undefined;
        }[];
        payrollId: string;
        payrollNumber: string;
        processedDate: string;
        totalGrossSalary: number;
        totalIncomeTax: number;
        totalSocialContributions: number;
        totalNetSalary: number;
        approvedBy?: string | undefined;
        notes?: string | undefined;
        paymentDate?: string | undefined;
        employerContributions?: number | undefined;
    }, {
        payrollPeriod: {
            startDate: string;
            endDate: string;
        };
        employees: {
            employeeId: string;
            baseSalary: number;
            netSalary: number;
            employeeNumber: string;
            employeeName: string;
            grossSalary: number;
            incomeTax: number;
            socialInsurance: number;
            healthInsurance: number;
            unemploymentInsurance: number;
            department?: string | undefined;
            costCenter?: string | undefined;
            otherDeductions?: number | undefined;
        }[];
        payrollId: string;
        payrollNumber: string;
        processedDate: string;
        totalGrossSalary: number;
        totalIncomeTax: number;
        totalSocialContributions: number;
        totalNetSalary: number;
        currency?: string | undefined;
        status?: "processed" | "approved" | "draft" | "paid" | undefined;
        approvedBy?: string | undefined;
        notes?: string | undefined;
        paymentDate?: string | undefined;
        employerContributions?: number | undefined;
    }>;
    readonly 'hrm.attendance.recorded': z.ZodObject<{
        attendanceId: z.ZodString;
        employeeId: z.ZodString;
        employeeName: z.ZodString;
        date: z.ZodString;
        checkInTime: z.ZodOptional<z.ZodString>;
        checkOutTime: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<["present", "absent", "late", "half_day", "excused"]>;
        workedHours: z.ZodOptional<z.ZodNumber>;
        overtime: z.ZodOptional<z.ZodNumber>;
        location: z.ZodOptional<z.ZodString>;
        device: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        approvedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "present" | "absent" | "late" | "half_day" | "excused";
        employeeId: string;
        date: string;
        employeeName: string;
        attendanceId: string;
        approvedBy?: string | undefined;
        notes?: string | undefined;
        location?: string | undefined;
        checkInTime?: string | undefined;
        checkOutTime?: string | undefined;
        workedHours?: number | undefined;
        overtime?: number | undefined;
        device?: string | undefined;
    }, {
        status: "present" | "absent" | "late" | "half_day" | "excused";
        employeeId: string;
        date: string;
        employeeName: string;
        attendanceId: string;
        approvedBy?: string | undefined;
        notes?: string | undefined;
        location?: string | undefined;
        checkInTime?: string | undefined;
        checkOutTime?: string | undefined;
        workedHours?: number | undefined;
        overtime?: number | undefined;
        device?: string | undefined;
    }>;
};
//# sourceMappingURL=hrm.events.d.ts.map