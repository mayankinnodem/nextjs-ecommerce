import mongoose from "mongoose";


const AboutSchema = new mongoose.Schema(
{
title: { type: String, required: true },
subtitle: { type: String },
description: { type: String },
image: {
url: String,
public_id: String,
},
stats: [
{
label: String,
value: String,
},
],
status: {
type: String,
enum: ["active", "inactive"],
default: "active",
},
},
{ timestamps: true }
);


export default mongoose.models.About || mongoose.model("About", AboutSchema);