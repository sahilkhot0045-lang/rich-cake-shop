export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err.errors) {
      const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
