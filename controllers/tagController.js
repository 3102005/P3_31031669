// controllers/tagController.js - NUEVO ARCHIVO
const { Tag } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.findAll();
  res.jsend.success(tags);
});

exports.getTagById = asyncHandler(async (req, res) => {
  const tag = await Tag.findByPk(req.params.id);
  if (!tag) {
    return res.status(404).jsend.fail('Tag not found');
  }
  res.jsend.success(tag);
});

exports.createTag = asyncHandler(async (req, res) => {
  // Use findOrCreate to make endpoint idempotent and avoid throwing on
  // unique constraint, returning the existing tag if it already exists.
  const [tag, created] = await Tag.findOrCreate({ where: { name: req.body.name }, defaults: req.body });
  res.status(201).jsend.success(tag);
});

exports.updateTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findByPk(req.params.id);
  if (!tag) {
    return res.status(404).jsend.fail('Tag not found');
  }
  
  await tag.update(req.body);
  res.jsend.success(tag);
});

exports.deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findByPk(req.params.id);
  if (!tag) {
    return res.status(404).jsend.fail('Tag not found');
  }
  
  await tag.destroy();
  res.jsend.success({ message: 'Tag deleted successfully' });
});