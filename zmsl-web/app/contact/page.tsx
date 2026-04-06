import ContactClient from './ContactClient';

export const metadata = {
  title: '联系我们 | ZMSL',
  description: 'ZMSL 官方联系方式，包括电子邮箱、QQ交流群、Discord服务器等。无论您需要技术支持、商务合作还是意见反馈，都可以通过这些渠道联系我们。',
};

export default function ContactPage() {
  return <ContactClient />;
}
