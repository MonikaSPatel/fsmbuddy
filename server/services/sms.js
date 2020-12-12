'use strict';
import request from 'request';
import regConst from '../modules/users/constant';
export const smsService = {

    /**
     * @description: send SMS
     * @param options "{
     *                      "message":<string>,
     *                      "to":<string> // comma separated number(s)
     *                 }"
     * @param callback
     */

    send: async (obj) => {
        if (obj.to) {
            obj.mobiles = obj.to;
        }
        let mobiles;
        if (_.isArray(obj.mobiles)) {
            obj.mobiles = _.map(obj.mobiles, (m) => {
                let tmpNo = m.split('+');
                return tmpNo[1] ? tmpNo[1] : tmpNo[0];
            });
            mobiles = obj.mobiles.join(',');
        }
        else {
            let tmpNo = obj.mobiles.split('+');
            mobiles = tmpNo[1] ? tmpNo[1] : tmpNo[0];
        }
        new Promise((resolve, reject) => {
            request.get({
                    url: regConst.message.SMS.URL,
                    qs: {
                        'loginid': regConst.message.SMS.LOGIN_ID,
                        'password': regConst.message.SMS.PASSWORD,
                        'v': 1.1,
                        'send_to': mobiles,//obj.mobiles,
                        'msg': obj.message,
                        'method': 'sendMessage',
                        'msg_type': 'text',
                    }
                },
                function (error, response, body) {
                    // var trackObj = {
                    //     type: sails.config.mail.ESN_SERVICE_SMS,
                    //     mobile: mobiles,
                    //     response: error ? {error: error} : {success: body},
                    //     request: obj,
                    //     payload: {'message': obj.smsText},
                    // };
                    // _.extend(trackObj, obj);
                    //
                    // MailService
                    //     .emailSmsTrack(trackObj, function () {
                    //
                    //     });
                    if (error) {
                        console.log('SMS err:', error);
                        reject(error);
                    }
                    else {
                        console.log('SMS body:', body);
                        resolve(body);
                    }
                });
        });
        return true;
    },

};
