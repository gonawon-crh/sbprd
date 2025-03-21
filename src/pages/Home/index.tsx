import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Typography>
        <Title level={2}>养老金计算器</Title>
        <Paragraph>
          本计算器可以帮助您估算退休后可以领取的养老金金额。计算结果仅供参考，实际养老金金额以社保部门核定为准。
        </Paragraph>
        <Title level={3}>计算说明</Title>
        <Paragraph>
          <ul>
            <li>养老金由基础养老金和个人账户养老金两部分组成</li>
            <li>基础养老金：每月工资的20%进入统筹基金，退休后由国家统一发放</li>
            <li>个人账户养老金：每月工资的8%进入个人养老金账户，属于个人所有</li>
            <li>退休年龄：男性63周岁，女性55周岁</li>
          </ul>
        </Paragraph>
        <Title level={3}>使用步骤</Title>
        <Paragraph>
          <ol>
            <li>填写个人基本信息（性别、出生年月、参加工作时间）</li>
            <li>录入个人缴费记录（可手动填写或通过Excel模板导入）</li>
            <li>系统自动计算您的养老金金额</li>
          </ol>
        </Paragraph>
      </Typography>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Button type="primary" size="large" onClick={() => navigate('/personal-info')}>
          开始测算
        </Button>
      </div>
    </div>
  );
};

export default Home;