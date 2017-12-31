import Modernizr from 'exports-loader?Modernizr!modernizr-custom'
import MobileDetect from 'mobile-detect'

const md = new MobileDetect(navigator.userAgent)
{
  // Modernizr + MobileDetect Mix-in
  const grade = md.mobileGrade()
  Modernizr.addTest({
    mobile: !!md.mobile(),
    phone: !!md.phone(),
    tablet: !!md.tablet(),
    mobilegradea: grade === 'A'
  })
}

export default {
  // DEV: process.env.NODE_ENV === 'development',
  DEV: false,
  mobile: md.mobile(),
  aspect: 1920 / 1280,
}
