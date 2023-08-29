require('dotenv').config();
const User = require('./models/user.model');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure Passport to use Google OAuth2 strategy
module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async function(accessToken, refreshToken, profile, done) {

    console.log(profile);
       
    const user = await User.findOne({ googleId: profile.id});
    if(user){
      return  done(null, user)
    }
    else{
        // create new User
        const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value
        });
        const user = await newUser.save();
        return done(null, user.id)
    }
}
));

// Serialize user profile into the session
passport.serializeUser((user, done) => {
    done(null, user);
});
  
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
          if(!user){
            throw new Error('User not found');
          }
          done(null, user);
    } catch (error) {
        done(error, null);
    }
});
};