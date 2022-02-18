const express = require('express');
const app = express();


app.get('/', (req, res) => {
    res.send('Hello!')
  })

  app.get('/test', (req, res) => {
    res.json({
      "responseVersion": "v3",
      "cardLabel": "Tickets",
      "allItemsLinkUrl": "https://example.com/all-items-link-url",
      "totalCount": 1,
      "topLevelActions": {
      "secondary": [
      {
      "type": "IFRAME",
      "width": 640,
      "height": 480,
      "url": "https://simpleform-34571.web.app",
      "label": "test_label_secondary",
      "propertyNamesIncluded": []
      }
      ],
      "settings": {
      "propertyNamesIncluded": [
      "some_crm_property"
      ],
      "width": 640,
      "label": "Edit",
      "type": "IFRAME",
      "url": "https://simpleform-34571.web.app",
      "height": 480
      },
      "primary": {
      "propertyNamesIncluded": [],
      "width": 640,
      "label": "test_label_primary",
      "type": "IFRAME",
      "url": "https://simpleform-34571.web.app",
      "height": 480
      }
      },
      "sections": [
      {
      "id": "123",
      "title": "API-22: APIs working too fast",
      "linkUrl": "http://example.com/1",
      "tokens": [
      {
      "name": "created",
      "label": "test_label",
      "dataType": "DATE",
      "value": "2016-08-04"
      }
      ],
      "actions": [
      {
      "type": "ACTION_HOOK",
      "httpMethod": "POST",
      "url": "https://example.com/action-hook-frame",
      "label": "action-hook-label",
      "propertyNamesIncluded": [
      "email",
      "firstName"
      ]
      },
      {
      "type": "ACTION_HOOK",
      "confirmation": {
      "prompt": "action-confirmation-body-prompt",
      "confirmButtonLabel": "Continue",
      "cancelButtonLabel": "Cancel"
      },
      "httpMethod": "POST",
      "url": "https://example.com/confirmation-action-hook",
      "label": "confirmation-hook-label",
      "propertyNamesIncluded": []
      },
      {
      "type": "IFRAME",
      "width": 640,
      "height": 480,
      "url": "https://example.com/iframe-action-label",
      "label": "iframe-action-label",
      "propertyNamesIncluded": [
      "property1",
      "property2",
      "property3"
      ]
      }
      ]
      }
      ]
      })
  })

const PORT = process.env.PORT ||5000;

app.listen(PORT,console.log(`Server started on port ${PORT}`));
