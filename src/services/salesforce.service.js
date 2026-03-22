import logger from "../utils/logger.util.js";
import { SALESFORCE_USERINFO_URL } from "../constant.js";

class SalesforceService {
  async getSalesforceProfile(token) {
    try {
      const response = await fetch(SALESFORCE_USERINFO_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error("Salesforce API error response", {
          service: "SalesForceService",
          endpoint: "salesforce",
          requestUrl: SALESFORCE_USERINFO_URL,
          status: response.status,
          response: errorData
        });
        return null; // Token invalid or request failed
      }

      const data = await response.json();
      
      logger.info("Salesforce request successful", {
        service: "SalesForceService",
        endpoint: "salesforce",
        requestUrl: SALESFORCE_USERINFO_URL,
        response: {
          userId: data.user_id || data.sub,
          email: data.email,
          name: data.name
        }
      });

      return data;
    } catch (error) {
      logger.error("Error communicating with Salesforce", {
        service: "SalesForceService",
        endpoint: "salesforce",
        error: error.message
      });
      return null;
    }
  }
}

export const salesforceService = new SalesforceService();
