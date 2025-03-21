import { Button, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import dayjs from 'dayjs';

const SOCIAL_AVERAGE_SALARY: Record<number, number> = {
  1993: 471, 1994: 617, 1995: 773, 1996: 889, 1997: 952,
  1998: 1005, 1999: 1179, 2000: 1285, 2001: 1480, 2002: 1623,
  2003: 1847, 2004: 2033, 2005: 2235, 2006: 2464, 2007: 2892,
  2008: 3292, 2009: 3566, 2010: 3896, 2011: 4331, 2012: 4692,
  2013: 5036, 2014: 5451, 2015: 5939, 2016: 6504, 2017: 7132,
  2018: 8765, 2019: 9580, 2020: 10338, 2021: 11396, 2022: 12183,
  2023: 12307, 2024: 12307
};

const { Title, Text } = Typography;

interface PensionDetail {
  year: number;
  socialAverageSalary: number;
  basicPension: number;
  personalAccountPension: number;
  monthlyPension: number;
}

const RETIREMENT_AGE_MONTHS: Record<number, number> = {
  50: 195, 51: 190, 52: 185, 53: 180, 54: 175, 55: 170,
  56: 164, 57: 158, 58: 152, 59: 145, 60: 139, 61: 132,
  62: 125, 63: 117, 64: 109, 65: 101, 66: 93, 67: 84,
  68: 75, 69: 65, 70: 56
};

const Result = () => {
  const navigate = useNavigate();
  const { userInfo, paymentRecords, clearAll } = useStore();

  // 计算退休时间
  const calculateRetirementDate = () => {
    const birthDate = dayjs(userInfo.birthDate);
    const retirementAge = userInfo.gender === 'male' ? 63 : 55;
    return birthDate.add(retirementAge, 'year').format('YYYY-MM');
  };

  // 计算累计缴费月数
  const calculateTotalPaymentMonths = () => {
    return paymentRecords.reduce((sum, record) => sum + record.paymentMonths, 0);
  };

  // 计算缴费年数
  const calculatePaymentYears = () => {
    return (calculateTotalPaymentMonths() / 12).toFixed(1);
  };

  // 计算基础养老金总额
  const calculateBasicPensionTotal = () => {
    return paymentRecords.reduce((sum, record) => {
      return sum + record.monthlySalary * 0.2 * record.paymentMonths;
    }, 0);
  };

  // 计算个人养老金总额
  const calculatePersonalPensionTotal = () => {
    return paymentRecords.reduce((sum, record) => {
      return sum + record.monthlySalary * 0.08 * record.paymentMonths;
    }, 0);
  };

  // 计算平均缴费指数
  const calculateAveragePaymentIndex = () => {
    const validRecords = paymentRecords.filter(record => record.paymentMonths > 0);
    if (validRecords.length === 0) return 0;
    const totalIndex = validRecords.reduce((sum, record) => sum + record.paymentIndex, 0);
    return Number((totalIndex / validRecords.length).toFixed(2));
  };

  // 获取养老金计发月数
  const getPensionPaymentMonths = () => {
    const retirementAge = userInfo.gender === 'male' ? 63 : 55;
    return RETIREMENT_AGE_MONTHS[retirementAge] || 0;
  };

  // 计算养老金发放明细
  const calculatePensionDetails = () => {
    const retirementYear = parseInt(calculateRetirementDate().split('-')[0]);
    const averagePaymentIndex = calculateAveragePaymentIndex();
    const paymentYears = parseFloat(calculatePaymentYears());
    const personalPensionTotal = calculatePersonalPensionTotal();
    const pensionPaymentMonths = getPensionPaymentMonths();
    const details: PensionDetail[] = [];

    let prevYearSalary = paymentRecords[paymentRecords.length - 1].socialAverageSalary;

    for (let year = retirementYear; year < retirementYear + 20; year++) {
      const basicPension = Math.round(
        prevYearSalary * (1 + averagePaymentIndex) / 2 * paymentYears * 0.01
      );

      const personalAccountPension = Math.round(
        personalPensionTotal / pensionPaymentMonths
      );

      details.push({
        year,
        socialAverageSalary: Math.round(prevYearSalary),
        basicPension,
        personalAccountPension,
        monthlyPension: basicPension + personalAccountPension
      });

      prevYearSalary = Math.round(prevYearSalary * 1.01);
    }

    return details;
  };

  const columns = [
    { title: '年份', dataIndex: 'year', key: 'year' },
    {
      title: '上年度社会平均工资',
      dataIndex: 'socialAverageSalary',
      key: 'socialAverageSalary',
      render: (value: number) => `${value}(预估)`
    },
    {
      title: '基础养老金',
      dataIndex: 'basicPension',
      key: 'basicPension'
    },
    {
      title: '个人账户养老金',
      dataIndex: 'personalAccountPension',
      key: 'personalAccountPension'
    },
    {
      title: '月退休工资',
      dataIndex: 'monthlyPension',
      key: 'monthlyPension'
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', height: '100vh', overflowY: 'auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '24px' }}>养老金计算结果</Title>
      
      <div style={{ marginBottom: '32px', background: '#f5f5f5', padding: '24px', borderRadius: '8px' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>基本信息</Title>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <Text>性别：{userInfo.gender === 'male' ? '男' : '女'}</Text>
          <Text>参加工作：{userInfo.workStartDate}</Text>
          <Text>出生日期：{userInfo.birthDate}</Text>
          <Text>退休时间：{calculateRetirementDate()}</Text>
          <Text>累计缴费月数：{calculateTotalPaymentMonths()}个月</Text>
          <Text>缴费年数：{calculatePaymentYears()}年</Text>
          <Text>基础养老金总额：{calculateBasicPensionTotal()}元</Text>
          <Text>个人养老金总额：{calculatePersonalPensionTotal()}元</Text>
          <Text>平均缴费指数：{calculateAveragePaymentIndex()}</Text>
          <Text>养老金计发月数：{getPensionPaymentMonths()}个月</Text>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>养老金发放明细</Title>
        <Table
          columns={columns}
          dataSource={calculatePensionDetails()}
          rowKey="year"
          pagination={false}
          scroll={{ x: true }}
          style={{ overflowX: 'auto' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
        <Button size="large" onClick={() => navigate('/payment-record')}>
          返回修改
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={() => {
            clearAll();
            navigate('/');
          }}
        >
          重新测算
        </Button>
      </div>
    </div>
  );
};

export default Result;