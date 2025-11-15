// controllers/categoryController.js - NUEVO ARCHIVO
const { Category } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll();
  res.jsend.success(categories);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).jsend.success(category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return res.status(404).jsend.fail('Category not found');
  }
  
  await category.update(req.body);
  res.jsend.success(category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return res.status(404).jsend.fail('Category not found');
  }
  
  await category.destroy();
  res.jsend.success({ message: 'Category deleted successfully' });
});