export const handler = async (event: any, context: any, callback: any) => {
    console.log("CDK_SCOPE " + process.env.CDK_SCOPE)
    console.log("event " + JSON.stringify(event, null, 2))
    
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-dynamo-db.html
    // let body;
    // let statusCode = 200;
    // const headers = {
    //     "Content-Type": "application/json",
    // };


    // try {
    //     switch (event.routeKey) {
    //     case "DELETE /items/{id}":
    //         body = `Deleted item ${event.pathParameters.id}`;
    //         break;
    //     case "GET /items/{id}":
    //         body = body.Item;
    //         break;
    //     case "GET /items":
    //         body = body.Items;
    //         break;
    //     case "PUT /items":
    //         let requestJSON = JSON.parse(event.body);
    //         body = `Put item ${requestJSON.id}`;
    //         break;
    //     default:
    //         throw new Error(`Unsupported route: "${event.routeKey}"`);
    //     }
    // } catch (err) {
    //     statusCode = 400;
    //     body = err.message;
    // } finally {
    //     body = JSON.stringify(body);
    // }

    // return {
    //     statusCode,
    //     body,
    //     headers,
    // };

    // https://docs.aws.amazon.com/cdk/v2/guide/serverless_example.html
    try {
        console.log("event: " + JSON.stringify(event, null, 2))
        const method = event.httpMethod;
        // Get name, if present
        const widgetId = event.path.startsWith('/') ? event.path.substring(1) : event.path;
    
        if (method === "GET") {
          // GET / to get the names of all widgets
          if (event.path === "/") {
            return {
              statusCode: 200,
              headers: {},
              body: JSON.stringify({ widgets: []})
            };
          }
    
          if (widgetId) {
            // GET /id to get info on widget
            return {
              statusCode: 200,
              headers: {},
              body: JSON.stringify({id: widgetId, type: "widgets"})
            };
          }
        }
    
        if (method === "POST") {
          return {
            statusCode: 200,
            headers: {},
            body: JSON.stringify({ widgets: [{id: 1, type: "widgets"}]}) 
          };
        }
    
        if (method === "DELETE") {
          // DELETE /name
          // Return an error if we do not have a name
          if (!widgetId) {
            return {
              statusCode: 400,
              headers: {},
              body: "Widget id missing"
            };
          }
    
          return {
            statusCode: 200,
            headers: {},
            body: "Successfully deleted widget " + widgetId
          };
        }
    
        // We got something besides a GET, POST, or DELETE
        return {
          statusCode: 400,
          headers: {},
          body: "We only accept GET, POST, and DELETE, not " + method
        };
      } catch(error) {
        var body = error.stack || JSON.stringify(error, null, 2);
        return {
          statusCode: 400,
          headers: {},
          body: body
        }
      }
  };