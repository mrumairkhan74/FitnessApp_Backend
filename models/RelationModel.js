const mongoose = require('mongoose');

const relationSchema = new mongoose.Schema({
    manualName: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['family', 'friendship', 'relationship', 'work', 'other'],
        required: true,
    },
    relationType: {
        type: String,
        trim: true,
        required: function () { return !this.relationManual; }
    },
    relationManual: {
        type: String,
        maxlength: 50,
        trim: true,
        required: function () { return !this.relationType; }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff',
        index: true
    },
    relatedMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'member',
        index: true
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    }
}, { timestamps: true });

// for fast queries
relationSchema.index({ createdBy: 1, relatedMember: 1, lead: 1 });


const validateRelations = {
    family: ['father', 'mother', 'daughter', 'brother', 'sister', 'son'],
    friendship: ['friend', 'bestfriend', 'closefriend', 'acquaintance'],
    relationship: ['partner', 'boyfriend', 'girlfriend', 'ex-partner'],
    work: ['colleague', 'boss', 'employee', 'business-partner', 'client'],
    other: ['roommate', 'mentor', 'neighbor', 'student', 'other']
};



// we can use Custom validator
relationSchema.path("relationType").validate(function (value) {
    const category = this.category;
    if (!category) return true;

    const allowed = validateRelations[category];
    return (allowed && allowed.includes(value)) || this.relationManual;
}, function (props) {
    return `Invalid relation type "${props.value}" for category "${this.category}". Allowed: ${validateRelations[this.category].join(", ")} or use relationManual.`;
});

const RelationModel = mongoose.model('Relation', relationSchema);
module.exports = RelationModel;
