import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ErrorLoggerService {
  private readonly logger = new Logger('TasteBot');

  logError(context: string, error: any, additionalData?: any): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      additionalData,
    };

    this.logger.error(`❌ ${context}: ${error.message}`, error.stack);
    
    // Log structured error data
    console.error('🔍 Error Details:', JSON.stringify(errorInfo, null, 2));
  }

  logWarning(context: string, message: string, data?: any): void {
    this.logger.warn(`⚠️ ${context}: ${message}`);
    if (data) {
      console.warn('📋 Warning Data:', data);
    }
  }

  logInfo(context: string, message: string, data?: any): void {
    this.logger.log(`ℹ️ ${context}: ${message}`);
    if (data) {
      console.log('📊 Info Data:', data);
    }
  }

  logToolExecution(toolName: string, params: any, result: any, executionTime?: number): void {
    const logData = {
      tool: toolName,
      params,
      success: result.success,
      executionTime: executionTime || 0,
      timestamp: new Date().toISOString(),
    };

    if (result.success) {
      this.logger.log(`🔧 Tool executed: ${toolName} (${executionTime}ms)`);
    } else {
      this.logger.error(`❌ Tool failed: ${toolName} - ${result.result}`);
    }

    console.log('🔧 Tool Execution:', JSON.stringify(logData, null, 2));
  }

  logUserInteraction(userId: string, action: string, data?: any): void {
    const interactionData = {
      userId,
      action,
      data,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`👤 User ${userId}: ${action}`);
    console.log('👤 User Interaction:', JSON.stringify(interactionData, null, 2));
  }

  logApiCall(service: string, endpoint: string, success: boolean, responseTime?: number): void {
    const apiData = {
      service,
      endpoint,
      success,
      responseTime,
      timestamp: new Date().toISOString(),
    };

    if (success) {
      this.logger.log(`🌐 API call: ${service}/${endpoint} (${responseTime}ms)`);
    } else {
      this.logger.error(`❌ API failed: ${service}/${endpoint}`);
    }

    console.log('🌐 API Call:', JSON.stringify(apiData, null, 2));
  }
}