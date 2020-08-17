module.exports.getMail = function (imageSrc, paragraph) {
  return `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Mailto</title>
    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700" rel="stylesheet">
    <style type="text/css">
      html {
        -webkit-text-size-adjust: none;
        -ms-text-size-adjust: none;
      }

      @media only screen and (min-device-width: 750px) {
        .table750 {
          width: 750px !important;
        }
      }

      @media only screen and (max-device-width: 750px),
      only screen and (max-width: 750px) {
        table[class="table750"] {
          width: 100% !important;
        }

        .mob_b {
          width: 93% !important;
          max-width: 93% !important;
          min-width: 93% !important;
        }

        .mob_b1 {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 100% !important;
        }

        .mob_left {
          text-align: left !important;
        }

        .mob_soc {
          width: 50% !important;
          max-width: 50% !important;
          min-width: 50% !important;
        }

        .mob_menu {
          width: 50% !important;
          max-width: 50% !important;
          min-width: 50% !important;
          box-shadow: inset -1px -1px 0 0 rgba(255, 255, 255, 0.2);
        }

        .mob_center {
          text-align: center !important;
        }

        .top_pad {
          height: 15px !important;
          max-height: 15px !important;
          min-height: 15px !important;
        }

        .mob_pad {
          width: 15px !important;
          max-width: 15px !important;
          min-width: 15px !important;
        }

        .mob_div {
          display: block !important;
        }
      }

      @media only screen and (max-device-width: 550px),
      only screen and (max-width: 550px) {
        .mod_div {
          display: block !important;
        }
      }

      .table750 {
        width: 750px;
      }
    </style>
  </head>

  <body style="margin: 0; padding: 0;">

    <table cellpadding="0" cellspacing="0" border="0" width="100%"
      style="background: white; min-width: 350px; font-size: 1px; line-height: normal;">
      <tr>
        <td align="center" valign="top">
          <!--[if (gte mso 9)|(IE)]>
          <table border="0" cellspacing="0" cellpadding="0">
          <tr><td align="center" valign="top" width="750"><![endif]-->
          <table cellpadding="0" cellspacing="0" border="0" width="750" class="table750"
            style="width: 100%; min-width: 350px; background: white;">
            <tr>
              <td align="center" valign="top" style="background: #ffffff;">

                <table cellpadding="0" cellspacing="0" border="0" width="100%"
                  style="width: 100% !important; min-width: 100%; max-width: 100%; background: white;">
                  <tr>
                    <td align="right" valign="top">
                      <div class="top_pad" style="height: 25px; line-height: 25px; font-size: 23px;">&nbsp;</div>
                    </td>
                  </tr>
                </table>

                <table cellpadding="0" cellspacing="0" border="0" width="88%"
                  style="width: 88% !important; min-width: 88%; max-width: 88%;">
                  <tr>
                    <td align="left" valign="top">
                      <div style="height: 33px; line-height: 33px; font-size: 31px;">&nbsp;</div>
                      <font face="'Source Sans Pro', sans-serif" color="#585858"
                        style="font-size: 14px;">
                        <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #585858; font-size: 14px;">
                          ${paragraph}
                        </span>
                      </font>
                      <br/>
                      <font face="'Source Sans Pro', sans-serif" color="#585858"
                        style="font-size: 24px;">
                        <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #585858; font-size: 14px;">
                          <p style="margin: 0px">Best,</p>
                          <p style="margin: 0px">Tech Team</p>
                          <img src="${imageSrc}" alt="CouchFashion" width="130" border="0" style="display: block; width: 130px; margin-top: 3px" />                                                    
                        </span>
                      </font>
                      <div style="height: 20px; line-height: 20px; font-size: 18px;">&nbsp;</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
  </body>

  </html>`;
}