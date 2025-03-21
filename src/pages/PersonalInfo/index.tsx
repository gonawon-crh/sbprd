import { Button, DatePicker, Form, Radio, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import dayjs from 'dayjs';

const { Title } = Typography;

const PersonalInfo = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useStore();

  const onFinish = (values: any) => {
    const formattedValues = {
      gender: values.gender,
      birthDate: values.birthDate.format('YYYY-MM'),
      workStartDate: values.workStartDate.format('YYYY-MM'),
    };
    setUserInfo(formattedValues);
    navigate('/payment-record');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>个人基本信息</Title>
      <Form
        layout="vertical"
        initialValues={{
          gender: userInfo.gender,
          birthDate: dayjs(userInfo.birthDate),
          workStartDate: dayjs(userInfo.workStartDate),
        }}
        onFinish={onFinish}
      >
        <Form.Item
          label="性别"
          name="gender"
          rules={[{ required: true, message: '请选择性别' }]}
        >
          <Radio.Group>
            <Radio value="male">男</Radio>
            <Radio value="female">女</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="出生年月"
          name="birthDate"
          rules={[{ required: true, message: '请选择出生年月' }]}
        >
          <DatePicker picker="month" />
        </Form.Item>

        <Form.Item
          label="参加工作时间"
          name="workStartDate"
          rules={[{ required: true, message: '请选择参加工作时间' }]}
        >
          <DatePicker picker="month" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            下一步
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PersonalInfo;