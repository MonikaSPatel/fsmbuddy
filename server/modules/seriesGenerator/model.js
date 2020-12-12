import mongoose from 'mongoose';
/**
 * SeriesGenerator.js
 */
const SeriesGeneratorSchema = new mongoose.Schema({
        // type of Series Generator from constant
        type: {
            type: Number,
            unique: true
        },
        // prefix of number setting
        prefix: {
            type: String
        },
        // postfix of number setting
        postfix: {
            type: String
        },
        // number starting from like 0,1 or 123
        startFrom: {
            type: Number,
            defaultsTo: 1
        },
        totalEntry: {
            type: Number,
        },
        // Start range length
        digitLength: {
            type: Number
        },
        isActive: {
            type: Boolean,
            defaultsTo: true

        }
    
});

const SeriesGenerator = mongoose.model('SeriesGenerator', SeriesGeneratorSchema);
// module.exports =SeriesGenerator;
export default SeriesGenerator;