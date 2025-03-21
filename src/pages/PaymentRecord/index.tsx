import { Button, InputNumber, Table, Typography, Upload } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import * as XLSX from 'xlsx';

import { useEffect } from 'react';

const { Title } = Typography;

interface PaymentRecord {
  year: number;
  socialAverageSalary: number;
  paymentMonths: number;
  monthlySalary: number;
  yearlyPayment: number;
  paymentIndex: number;
}

const SOCIAL_AVERAGE_SALARY: Record<number, number> = {
  1993: 471, 1994: 617, 1995: 773, 1996: 889, 1997: 952,
  1998: 1005, 1999: 1179, 2000: 1285, 2001: 1480, 2002: 1623,
  2003: 1847, 2004: 2033, 2005: 2235, 2006: 2464, 2007: 2892,
  2008: 3292, 2009: 3566, 2010: 3896, 2011: 4331, 2012: 4692,
  2013: 5036, 2014: 5451, 2015: 5939, 2016: 6504, 2017: 7132,
  2018: 8765, 2019: 9580, 2020: 10338, 2021: 11396, 2022: 12183,
  2023: 12307, 2024: 12307
};

const PaymentRecord = () => {
  const navigate = useNavigate();
  const { userInfo, paymentRecords, setPaymentRecords } = useStore();

  // 在组件加载时初始化数据
  useEffect(() => {
    if (paymentRecords.length === 0 || userInfo.workStartDate) {
      initializePaymentRecords();
    }
  }, [userInfo]);

  // 计算退休年龄
  const calculateRetirementYear = () => {
    const birthYear = parseInt(userInfo.birthDate.split('-')[0]);
    const retirementAge = userInfo.gender === 'male' ? 63 : 55;
    return birthYear + retirementAge;
  };

  // 生成年份范围内的社会平均工资
  const generateSocialAverageSalary = (year: number) => {
    if (year <= 2024) return SOCIAL_AVERAGE_SALARY[year] || 0;
    let salary = SOCIAL_AVERAGE_SALARY[2024];
    for (let i = 2025; i <= year; i++) {
      salary *= 1.01; // 每年增长1%
    }
    return Math.round(salary);
  };

  // 初始化缴费记录
  const initializePaymentRecords = () => {
    const startYear = parseInt(userInfo.workStartDate.split('-')[0]);
    const endYear = calculateRetirementYear();
    const records: PaymentRecord[] = [];

    for (let year = startYear; year <= endYear; year++) {
      records.push({
        year,
        socialAverageSalary: generateSocialAverageSalary(year),
        paymentMonths: 0,
        monthlySalary: 0,
        yearlyPayment: 0,
        paymentIndex: 0
      });
    }

    setPaymentRecords(records);
  };

  // 导出模板
  const exportTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(paymentRecords);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '缴费记录');
    XLSX.writeFile(wb, '养老金缴费记录模板.xlsx');
  };

  // 导入模板
  const importTemplate = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const records = XLSX.utils.sheet_to_json(worksheet) as PaymentRecord[];
      setPaymentRecords(records);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  // 更新缴费记录
  const updateRecord = (index: number, values: Partial<PaymentRecord>) => {
    const newRecords = [...paymentRecords];
    const record = newRecords[index];

    if (values.paymentMonths !== undefined) {
      record.paymentMonths = values.paymentMonths;
      if (record.monthlySalary > 0) {
        record.yearlyPayment = record.monthlySalary * 0.08 * record.paymentMonths;
      }
    } else if (values.monthlySalary !== undefined) {
      record.monthlySalary = values.monthlySalary;
      record.yearlyPayment = values.monthlySalary * 0.08 * record.paymentMonths;
    } else if (values.yearlyPayment !== undefined) {
      record.yearlyPayment = values.yearlyPayment;
      record.monthlySalary = record.paymentMonths > 0 ?
        Math.round(values.yearlyPayment / (0.08 * record.paymentMonths)) : 0;
    }

    record.paymentIndex = record.socialAverageSalary > 0 ?
      Math.min(3, Number((record.monthlySalary / record.socialAverageSalary).toFixed(2))) : 0;

    setPaymentRecords(newRecords);
  };

  // 复制当前行数据到下方所有行
  const copyToBelow = (index: number) => {
    const newRecords = [...paymentRecords];
    const sourceRecord = newRecords[index];

    for (let i = index + 1; i < newRecords.length; i++) {
      newRecords[i] = {
        ...newRecords[i],
        paymentMonths: sourceRecord.paymentMonths,
        monthlySalary: sourceRecord.monthlySalary,
        yearlyPayment: sourceRecord.yearlyPayment,
        paymentIndex: newRecords[i].socialAverageSalary > 0 ?
          Math.min(3, Number((sourceRecord.monthlySalary / newRecords[i].socialAverageSalary).toFixed(2))) : 0
      };
    }

    setPaymentRecords(newRecords);
  };

  const columns = [
    { title: '年份', dataIndex: 'year', key: 'year', align: 'center' as const, width: 80, fixed: 'left' as const },
    {
      title: '社会平均工资',
      dataIndex: 'socialAverageSalary',
      key: 'socialAverageSalary',
      align: 'center' as const,
      width: 140, fixed: 'left' as const,
      render: (value: number, record: PaymentRecord) =>
        `${value.toLocaleString()}${record.year > 2024 ? '(预估)' : ''}`
    },
    {
      title: '缴费月数',
      dataIndex: 'paymentMonths',
      key: 'paymentMonths',
      align: 'center' as const,
      width: 100, fixed: 'left' as const,
      render: (_: any, record: PaymentRecord, index: number) => (
        <InputNumber
          min={0} precision={0}
          max={24}
          value={record.paymentMonths}
          onChange={(value) => {
            const newValue = value === null ? 0 : value;
            updateRecord(index, { paymentMonths: newValue });
          }}
          style={{ width: '90%' }}
        />
      )
    },
    {
      title: '月工资',
      dataIndex: 'monthlySalary',
      key: 'monthlySalary',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: PaymentRecord, index: number) => (
        <InputNumber
          min={0} precision={0}
          value={record.monthlySalary}
          onChange={(value) => updateRecord(index, { monthlySalary: value || 0 })}
          style={{ width: '90%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
        />
      )
    },
    {
      title: '年缴费总额',
      dataIndex: 'yearlyPayment',
      key: 'yearlyPayment',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: PaymentRecord, index: number) => (
        <InputNumber
          min={0} precision={0}
          value={record.yearlyPayment}
          onChange={(value) => updateRecord(index, { yearlyPayment: value || 0 })}
          style={{ width: '90%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
        />
      )
    },
    {
      title: '当年缴费指数',
      dataIndex: 'paymentIndex',
      key: 'paymentIndex',
      width: 120,
      align: 'center' as const
    },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      render: (_: any, _record: PaymentRecord, index: number) => (
        <Button type="link" onClick={() => copyToBelow(index)}>
          以下相同
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 24px 0' }}>
          <Title level={2} style={{ margin: 0 }}>个人缴费记录</Title>
          <div>
            <Upload
              accept=".xlsx,.xls"
              beforeUpload={importTemplate}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} style={{ marginRight: '8px' }}>
                导入模板
              </Button>
            </Upload>
            <Button
              icon={<DownloadOutlined />}
              onClick={exportTemplate}
              style={{ marginRight: '8px' }}
            >
              导出模板
            </Button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Table
            dataSource={paymentRecords}
            columns={columns}
            rowKey="year"
            pagination={false}
            bordered
            scroll={{ x: 'max-content', y: 'calc(100vh - 250px)' }}
            sticky
          />
        </div>
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <Button type="primary" onClick={() => navigate('/result')} size="large">
            开始测算
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentRecord;