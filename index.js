const express = require("express");
const app = express();
const port = 3000;
const { google } = require("googleapis");

app.use(express.json({ extended: false }));

const googleClientId =
  "592433661407-nalecnnjlu2tts96bajb7ac61pqrep92.apps.googleusercontent.com";
const googleClientSecret = "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";

const oauth2client = new google.auth.OAuth2(
  googleClientId,
  googleClientSecret,
  "http://localhost:3000"
);
app.post("/rest/v1/calendar/init", async (req, res) => {
  try {
    let code = req.body.code; //this code will come from front-end
    const token = await oauth2client.getToken(code);
    if (token) {
      //redirect to google calendar view with token
      res.redirect("/rest/v1/calendar/redirect/?token=" + token);
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.get("/rest/v1/calendar/redirect/", async (req, res) => {
  try {
    //get the token from query which is sent at redirect time
    let refreshToken = req.query.token;
    oauth2client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar("v1");
    await calendar.events.list(
      {
        auth: oauth2client,
        calendarId: "primary",
      },
      (error, result) => {
        if (error) {
          res.send(JSON.stringify({ error: error }));
        } else {
          if (result.data.items.length) {
            res.send(JSON.stringify({ events: result.data.items }));
          } else {
            res.send(JSON.stringify({ message: "No upcoming events found." }));
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
