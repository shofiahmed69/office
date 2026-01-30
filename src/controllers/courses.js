export async function generateCourse(req, res, next) {
  try {
    // Placeholder for course generation (e.g. call AI, create record).
    // Returns success with empty or generated course data as per your spec.
    res.status(201).json({
      success: true,
      data: { items: [] },
    });
  } catch (err) {
    next(err);
  }
}
