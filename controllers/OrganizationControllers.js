const Organization = require('../models/Organization');
const mongoose = require('mongoose');
const moment = require('moment');



const getOrganization = async (req, res) => {
    const { page, sort, search, limit } = req.query;

    const queryObject = { createdBy: req.user._id }

    if (search) {
        queryObject.name = { $regex: search, $options: 'i' }
    }

    const orgResult = await Organization.findOne(queryObject);

    //sorting 
    if (sort === 'latest') {
        orgResult = orgResult.sort('-createdAt')
    }
    if (sort === 'oldest') {
        orgResult = orgResult.sort('createdAt')
    }
    if (sort === 'a-z') {
        orgResult = orgResult.sort('name')
    }
    if (sort === 'z-a') {
        orgResult = orgResult.sort('-name')
    }


    // Pagination
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    orgResult = orgResult.skip(skip).limit(limitNumber);

    const organization = await orgResult;
    const totalOrganizations = await Organization.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalOrganizations / limitNumber);


    return res.status(200).json({
        status: true,
        message: "All Organization Received",
        organization,
        totalOrganizations,
        numOfPages
    })


}

const getOrganizationId = async (req, res) => {
    const { id: orgId } = req.params;

    const organizationId = await Organization.findOne({ _id: orgId }).exec();

    if (!organizationId) {
        return res.status(400).json({
            status: false,
            message: `No organization with id: ${orgId}`,
        })
    }

    return res.status(200).json({
        status: true,
        message: "Single Organization Received!!",
        organizationId
    })

}

const createOrganization = async (req, res) => {
    // const { id: orgId } = req.params;
    const { name, contact_name, contact_email, address, image, code } = req.body;

    if (!name || !contact_name || !contact_email || !address || !image) {
        return res.status(400).json({
            status: false,
            message: 'Please provide all values'
        })
    }

    const allOrg = await Organization.find();

    const orgCode = `JOB/ORG/${allOrg.length}`;

    try {
        if (image) {
            const uploadedResponse = await cloudinary.uploader.upload(image, {
                upload_preset: "online-shop",
            });

            if (uploadedResponse) {
                const organization = new Organization({
                    name,
                    contact_name,
                    contact_email,
                    address,
                    code: orgCode,
                    image: uploadedResponse,
                });

                const savedOrganization = await organization.save();
                return res.status(200).json({
                    status: true,
                    message: "successfully Created Organization",
                    savedOrganization
                })
            }

        }

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

const updateOrganization = async (req, res) => {
    // const { id: jobId } = req.params;
    const { name, contact_name, contact_email, address, image } = req.body;

    try {
        if (!name || !contact_name || !contact_email || !address || !image) {
            return res.status(400).json({
                status: false,
                message: 'Please provide all values'
            })
        }

        const updatedOrganization = await Organization.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );

        return res.status(200).json({
            status: true,
            message: "successfully Updated Organization",
            updatedOrganization
        })

    } catch (error) {
        
        return res.status(500).json({
            status: false,
            message: error.message,
            
        })
    }
}

const deleteOrganization = async(req, res) => {
    const { id: orgId } = req.params;

    const organization = await Organization.findOne({ _id: orgId}).exec();

    if (!organization) {
        return res.status(400).json({
            status: false,
            message: "Organization Not Found!",
        })
    }

    const deleteOrg = await organization.findOneAndDelete({ orgId})

    console.log("was it deleted..", deleteOrg);

    return res.status(200).json({
        status: true, 
        message: `This organization with id: ${orgId} was successfully Deleted.`,
        deleteOrg
    })
}

const showOrgStatus = async(req, res) => {
    let orgStatus = await Organization.aggregate([
        { $match : { createdBy : mongoose.Types.ObjectId(req.user._id)} },
        { 
            $group : { 
                _id : {
                    name: { $name: 'createdAt'},
                }, 
                count : { $sum : 1 } 
            } 
        },
        { $sort : { '_id.name' : 1} },

    ])

    orgStatus = orgStatus.map((item) => {
        const { _id: { name }, count } = item;
        const date = moment().month(name - 1).year(name).format('MMM Y')
        return { date, count }
    }).reverse()

    return res.status(200).json({
        status: true,
        message: "Organization Displayed",
        orgStatus
    })
}




module.exports = { showOrgStatus, getOrganization, getOrganizationId, createOrganization, updateOrganization, deleteOrganization }