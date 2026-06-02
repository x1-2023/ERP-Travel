# API Error Codes Reference

This document provides a comprehensive reference for all API error codes used in the Trade Promotion Management System.

## Error Response Format

All API errors follow a consistent JSON format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "requestId": "abc123-def456"
  }
}
```

## HTTP Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content to return |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## Authentication Errors (AUTH_*)

### AUTH_001 - Invalid Credentials
- **HTTP Status**: 401
- **Message**: "Invalid email or password"
- **Cause**: Login attempt with incorrect credentials
- **Solution**: Verify email and password are correct

### AUTH_002 - Token Expired
- **HTTP Status**: 401
- **Message**: "Authentication token has expired"
- **Cause**: JWT token has exceeded its validity period
- **Solution**: Refresh the token or log in again

### AUTH_003 - Token Invalid
- **HTTP Status**: 401
- **Message**: "Invalid authentication token"
- **Cause**: Malformed or tampered JWT token
- **Solution**: Log in again to obtain a new token

### AUTH_004 - Token Missing
- **HTTP Status**: 401
- **Message**: "Authentication token is required"
- **Cause**: Request to protected endpoint without Authorization header
- **Solution**: Include `Authorization: Bearer <token>` header

### AUTH_005 - Refresh Token Invalid
- **HTTP Status**: 401
- **Message**: "Invalid refresh token"
- **Cause**: Refresh token is expired or revoked
- **Solution**: Log in again to obtain new tokens

### AUTH_006 - Account Locked
- **HTTP Status**: 403
- **Message**: "Account has been locked due to multiple failed login attempts"
- **Cause**: Too many failed login attempts
- **Solution**: Wait for lockout period or contact administrator

### AUTH_007 - Account Disabled
- **HTTP Status**: 403
- **Message**: "Account has been disabled"
- **Cause**: Administrator has disabled the account
- **Solution**: Contact system administrator

### AUTH_008 - Session Expired
- **HTTP Status**: 401
- **Message**: "Session has expired"
- **Cause**: User session has timed out
- **Solution**: Log in again

---

## Authorization Errors (AUTHZ_*)

### AUTHZ_001 - Permission Denied
- **HTTP Status**: 403
- **Message**: "You do not have permission to perform this action"
- **Cause**: User lacks required role or permission
- **Solution**: Request appropriate permissions from administrator

### AUTHZ_002 - Role Required
- **HTTP Status**: 403
- **Message**: "This action requires {role} role"
- **Cause**: Endpoint requires specific role
- **Solution**: Contact administrator to assign required role

### AUTHZ_003 - Resource Access Denied
- **HTTP Status**: 403
- **Message**: "You do not have access to this resource"
- **Cause**: User cannot access resource owned by another user/team
- **Solution**: Request access from resource owner

### AUTHZ_004 - Action Not Allowed
- **HTTP Status**: 403
- **Message**: "This action is not allowed in current state"
- **Cause**: Attempting action on resource in incompatible state
- **Solution**: Check resource state before attempting action

---

## Validation Errors (VAL_*)

### VAL_001 - Required Field Missing
- **HTTP Status**: 422
- **Message**: "Field '{field}' is required"
- **Cause**: Required field not provided in request
- **Solution**: Include all required fields

### VAL_002 - Invalid Format
- **HTTP Status**: 422
- **Message**: "Field '{field}' has invalid format"
- **Cause**: Field value doesn't match expected format
- **Solution**: Check field format requirements

### VAL_003 - Invalid Value
- **HTTP Status**: 422
- **Message**: "Field '{field}' has invalid value"
- **Cause**: Field value is not in allowed set
- **Solution**: Use allowed values for the field

### VAL_004 - Value Out of Range
- **HTTP Status**: 422
- **Message**: "Field '{field}' must be between {min} and {max}"
- **Cause**: Numeric value outside allowed range
- **Solution**: Provide value within allowed range

### VAL_005 - Invalid Date
- **HTTP Status**: 422
- **Message**: "Field '{field}' must be a valid date"
- **Cause**: Date value is invalid or in wrong format
- **Solution**: Use ISO 8601 date format (YYYY-MM-DD)

### VAL_006 - Date Range Invalid
- **HTTP Status**: 422
- **Message**: "End date must be after start date"
- **Cause**: Date range is invalid
- **Solution**: Ensure end date is after start date

### VAL_007 - Invalid Email
- **HTTP Status**: 422
- **Message**: "Invalid email address format"
- **Cause**: Email doesn't match valid format
- **Solution**: Provide valid email address

### VAL_008 - Invalid Phone
- **HTTP Status**: 422
- **Message**: "Invalid phone number format"
- **Cause**: Phone number doesn't match expected format
- **Solution**: Use format: +84 or 0 followed by 9-10 digits

### VAL_009 - Invalid Tax Code
- **HTTP Status**: 422
- **Message**: "Invalid tax code format"
- **Cause**: Tax code doesn't match Vietnamese format
- **Solution**: Use 10 or 13 digit format (10 digits or 10-3 digits)

### VAL_010 - Budget Exceeded
- **HTTP Status**: 422
- **Message**: "Promotion budget exceeds available budget"
- **Cause**: Attempting to allocate more budget than available
- **Solution**: Reduce promotion budget or request budget increase

---

## Promotion Errors (PROMO_*)

### PROMO_001 - Not Found
- **HTTP Status**: 404
- **Message**: "Promotion not found"
- **Cause**: Promotion ID doesn't exist
- **Solution**: Verify promotion ID

### PROMO_002 - Already Exists
- **HTTP Status**: 409
- **Message**: "Promotion with this code already exists"
- **Cause**: Duplicate promotion code
- **Solution**: Use unique promotion code

### PROMO_003 - Invalid Status Transition
- **HTTP Status**: 422
- **Message**: "Cannot transition from '{current}' to '{target}'"
- **Cause**: Invalid workflow state transition
- **Solution**: Follow valid workflow: Draft → Pending → Approved → Active → Completed

### PROMO_004 - Cannot Modify Active
- **HTTP Status**: 422
- **Message**: "Cannot modify active promotion"
- **Cause**: Attempting to edit promotion in Active state
- **Solution**: Complete or cancel promotion before modifying

### PROMO_005 - Overlapping Period
- **HTTP Status**: 409
- **Message**: "Promotion period overlaps with existing promotion"
- **Cause**: Date range conflicts with another promotion
- **Solution**: Adjust dates to avoid overlap

### PROMO_006 - Already Approved
- **HTTP Status**: 422
- **Message**: "Promotion has already been approved"
- **Cause**: Attempting to approve already approved promotion
- **Solution**: No action needed

### PROMO_007 - Cannot Delete
- **HTTP Status**: 422
- **Message**: "Cannot delete promotion with existing claims"
- **Cause**: Promotion has associated claims
- **Solution**: Handle claims before deleting promotion

### PROMO_008 - Expired
- **HTTP Status**: 422
- **Message**: "Promotion has expired"
- **Cause**: Promotion end date has passed
- **Solution**: Create new promotion or extend dates

---

## Claim Errors (CLAIM_*)

### CLAIM_001 - Not Found
- **HTTP Status**: 404
- **Message**: "Claim not found"
- **Cause**: Claim ID doesn't exist
- **Solution**: Verify claim ID

### CLAIM_002 - Already Processed
- **HTTP Status**: 422
- **Message**: "Claim has already been processed"
- **Cause**: Attempting to process already processed claim
- **Solution**: Check claim status before processing

### CLAIM_003 - Invalid Amount
- **HTTP Status**: 422
- **Message**: "Claim amount exceeds promotion budget"
- **Cause**: Claim amount too high
- **Solution**: Reduce claim amount or increase budget

### CLAIM_004 - Missing Documents
- **HTTP Status**: 422
- **Message**: "Required documents are missing"
- **Cause**: Claim submitted without required attachments
- **Solution**: Upload all required documents

### CLAIM_005 - Duplicate Claim
- **HTTP Status**: 409
- **Message**: "Duplicate claim for this period"
- **Cause**: Claim already exists for same customer/period
- **Solution**: Review existing claims

### CLAIM_006 - Promotion Inactive
- **HTTP Status**: 422
- **Message**: "Cannot create claim for inactive promotion"
- **Cause**: Associated promotion is not active
- **Solution**: Verify promotion is in Active state

### CLAIM_007 - Verification Failed
- **HTTP Status**: 422
- **Message**: "Claim verification failed"
- **Cause**: Claim data doesn't match expected values
- **Solution**: Review and correct claim data

### CLAIM_008 - Approval Required
- **HTTP Status**: 422
- **Message**: "Claim requires approval before processing"
- **Cause**: Attempting to process unapproved claim
- **Solution**: Get claim approved first

---

## Finance Errors (FIN_*)

### FIN_001 - Accrual Not Found
- **HTTP Status**: 404
- **Message**: "Accrual record not found"
- **Cause**: Accrual ID doesn't exist
- **Solution**: Verify accrual ID

### FIN_002 - Already Posted
- **HTTP Status**: 422
- **Message**: "Transaction has already been posted"
- **Cause**: Attempting to modify posted transaction
- **Solution**: Create reversal if needed

### FIN_003 - Period Closed
- **HTTP Status**: 422
- **Message**: "Accounting period is closed"
- **Cause**: Attempting to post to closed period
- **Solution**: Reopen period or use current period

### FIN_004 - Insufficient Balance
- **HTTP Status**: 422
- **Message**: "Insufficient budget balance"
- **Cause**: Transaction exceeds available budget
- **Solution**: Request budget increase

### FIN_005 - Invalid Account
- **HTTP Status**: 422
- **Message**: "Invalid GL account"
- **Cause**: General ledger account doesn't exist
- **Solution**: Use valid GL account code

### FIN_006 - Deduction Mismatch
- **HTTP Status**: 422
- **Message**: "Deduction amount doesn't match claim"
- **Cause**: Deduction amount differs from claim
- **Solution**: Reconcile amounts before posting

### FIN_007 - Journal Imbalanced
- **HTTP Status**: 422
- **Message**: "Journal entries do not balance"
- **Cause**: Debit and credit totals don't match
- **Solution**: Verify journal entries balance

### FIN_008 - Reversal Not Allowed
- **HTTP Status**: 422
- **Message**: "Reversal not allowed for this transaction"
- **Cause**: Transaction cannot be reversed
- **Solution**: Contact finance administrator

---

## Customer Errors (CUST_*)

### CUST_001 - Not Found
- **HTTP Status**: 404
- **Message**: "Customer not found"
- **Cause**: Customer ID doesn't exist
- **Solution**: Verify customer ID

### CUST_002 - Duplicate Tax Code
- **HTTP Status**: 409
- **Message**: "Customer with this tax code already exists"
- **Cause**: Tax code already registered
- **Solution**: Search for existing customer

### CUST_003 - Invalid Region
- **HTTP Status**: 422
- **Message**: "Invalid region code"
- **Cause**: Region code not in system
- **Solution**: Use valid region code

### CUST_004 - Inactive Customer
- **HTTP Status**: 422
- **Message**: "Customer is inactive"
- **Cause**: Customer has been deactivated
- **Solution**: Reactivate customer first

---

## Rate Limit Errors (RATE_*)

### RATE_001 - Too Many Requests
- **HTTP Status**: 429
- **Message**: "Rate limit exceeded. Please try again later."
- **Cause**: Too many requests in time window
- **Solution**: Wait and retry after Retry-After header duration
- **Headers**:
  - `Retry-After`: Seconds until rate limit resets
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Timestamp when limit resets

### RATE_002 - Auth Rate Limited
- **HTTP Status**: 429
- **Message**: "Too many authentication attempts"
- **Cause**: Too many login attempts
- **Solution**: Wait 5 minutes before retrying

---

## System Errors (SYS_*)

### SYS_001 - Internal Error
- **HTTP Status**: 500
- **Message**: "An internal error occurred"
- **Cause**: Unexpected server error
- **Solution**: Contact support with request ID

### SYS_002 - Database Error
- **HTTP Status**: 500
- **Message**: "Database operation failed"
- **Cause**: Database connectivity or query error
- **Solution**: Retry request; contact support if persists

### SYS_003 - Service Unavailable
- **HTTP Status**: 503
- **Message**: "Service temporarily unavailable"
- **Cause**: System maintenance or overload
- **Solution**: Retry after short delay

### SYS_004 - External Service Error
- **HTTP Status**: 502
- **Message**: "External service error"
- **Cause**: Third-party service failure
- **Solution**: Retry request; check external service status

### SYS_005 - Timeout
- **HTTP Status**: 504
- **Message**: "Request timed out"
- **Cause**: Operation took too long
- **Solution**: Retry with smaller data set or contact support

---

## File Upload Errors (FILE_*)

### FILE_001 - Too Large
- **HTTP Status**: 413
- **Message**: "File size exceeds maximum limit"
- **Cause**: Upload exceeds 10MB limit
- **Solution**: Reduce file size or split into multiple uploads

### FILE_002 - Invalid Type
- **HTTP Status**: 422
- **Message**: "File type not allowed"
- **Cause**: File extension not in allowed list
- **Solution**: Use allowed types: PDF, XLSX, XLS, CSV, JPG, PNG

### FILE_003 - Upload Failed
- **HTTP Status**: 500
- **Message**: "File upload failed"
- **Cause**: Storage service error
- **Solution**: Retry upload

### FILE_004 - Not Found
- **HTTP Status**: 404
- **Message**: "File not found"
- **Cause**: File has been deleted or doesn't exist
- **Solution**: Verify file ID

---

## Error Handling Best Practices

### Client-Side Handling

```typescript
async function apiRequest(url: string, options: RequestInit) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();

    switch (response.status) {
      case 401:
        // Redirect to login
        break;
      case 403:
        // Show permission denied message
        break;
      case 422:
        // Show validation errors
        break;
      case 429:
        // Implement retry with backoff
        const retryAfter = response.headers.get('Retry-After');
        break;
      default:
        // Show generic error message
    }

    throw new ApiError(error);
  }

  return response.json();
}
```

### Retry Strategy

For transient errors (5xx, 429), implement exponential backoff:

```typescript
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      if (!isRetryable(error)) throw error;

      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## Contact Support

If you encounter persistent errors:

1. Note the `requestId` from the error response
2. Check system status at `/api/health`
3. Contact support with:
   - Request ID
   - Timestamp
   - Steps to reproduce
   - Request/response details
