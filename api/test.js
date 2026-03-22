/**
 * 简单的测试端点
 */
module.exports = async (request, response) => {
  response.status(200).json({
    status: 'ok',
    message: 'Vercel 部署成功！',
    timestamp: new Date().toISOString()
  });
};
