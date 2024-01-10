/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable linebreak-style */
// eslint-disable-next-line import/no-extraneous-dependencies
const cron = require('node-cron');
const db = require('../db');
const utils = require('../utils');
const links = require('../models/links');
const couponCodes = require('../models/coupon_codes');
const logger = require('../logger');
const User = require('../models/users');
const mail = require('../mail/config');
require('dotenv').config();

const { MY_DOMAIN_NAME } = process.env;
const {TELEGRAM_BOT_USERNAME} = process.env;

const expireCoupons = async () => {
  try {
    console.log(`Cron Job Running at ${new Date()}`);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const transactions = await couponCodes.find({ isExpired: false, isUsed: false, createdAt: { $gt: twoDaysAgo } });

    const updatePromises = transactions.map(async (transaction) => {
      const { senderTGID } = transaction;
      const user = await User.findOneAndUpdate({ phone: senderTGID }, { $inc: { walletBalance: transaction.amount } });
      if (user) {
          const emailMsgTemplate = `
          We hope this message finds you well. We wanted to inform you that no users have utilized the link associated with your data share.
          \n As a result, the link ${TELEGRAM_BOT_USERNAME}/${transaction.couponCode} has expired, and the amount of NGN ${transaction.amount} has been successfully returned to your wallet.
          \n\n
          Your updated wallet balance is now NGN ${user.walletBalance}. \n We appreciate your continued patronage and look forward to serving you in the future.
        `;
          if (user.email) {
            await mail.main('Coupon Code Expired', emailMsgTemplate, user.email);
          } else {
            console.log('No email found!');
            console.error('No email found!');
            logger.error('No email found!');
          }
      }
    });

    await Promise.all(updatePromises);
    const updateTransaction = await couponCodes.updateMany({ isExpired: false, isUsed: false, createdAt: { $gt: twoDaysAgo } }, { $set: { isExpired: true, updatedAt: Date.now() } });

    logger.info('Updated DB completed!');
  } catch (err) {
    logger.error(err);
    console.log(err);
  }
};

const task = cron.schedule('0 0 */2 * *', expireCoupons, {
  scheduled: true,
  timezone: 'Africa/Lagos',
});

// cronTask.start();
task.start();
module.exports = task;
