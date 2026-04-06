import DonateClient from './DonateClient';

export const metadata = {
  title: '赞助支持 | ZMSL',
  description: '支持 ZMSL 开源项目，您的赞助将帮助我们持续改进和维护项目。每一份支持都是对我们工作的认可和鼓励！',
};

export default function DonatePage() {
  return <DonateClient />;
}
