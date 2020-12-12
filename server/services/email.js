import Email from 'email-templates';
import nodemailer from 'nodemailer';
export const emailService = {
    send: function (obj, cb) {
        let transport = nodemailer.createTransport({
            service: 'Mailgun',
            auth: {
                user: 'postmaster@democ.in',
                pass: 'Democ@Admin@2090#'
            }
        });
        const email = new Email({
            message: {
                from: obj.from || 'nidhi.desai@coruscate.in',
                subject: obj.subject
            },
            send: true,
            transport: transport,
            views: {
                options: {
                    extension: 'ejs' // <---- HERE
                }
            }
        });
        if (!_.isArray(obj.to)) {
            obj.to = [obj.to];
        }
        Promise.all(_.map(obj.to, (emailId) => {
            email
                .send({
                    template: obj.template,
                    message: {
                        to: emailId,    
                    },
                    locals: obj.data
                }).then((res) => {
                    console.log('res.originalMessage', res.originalMessage)
            })
        }));
    }
};

export default emailService;

