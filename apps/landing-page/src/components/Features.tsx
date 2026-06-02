"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import CircuitBackground from "./CircuitBackground";
import { Code, Shield, Globe, Workflow, Cloud, Users } from "lucide-react";

const features = [
  { icon: Code, title: "Open Source", desc: "Mã nguồn mở 100%, MIT License. Fork, customize, deploy tự do. 1.4 triệu dòng mã TypeScript.", color: "#22c55e" },
  { icon: Shield, title: "Enterprise Security", desc: "Rate limiting, CORS, CSRF, input sanitization, security headers. Audit trail cho mọi thao tác.", color: "#8b5cf6" },
  { icon: Globe, title: "Vietnam-First", desc: "Tuân thủ VAS TT200, hoá đơn điện tử NĐ123, BHXH/BHYT/BHTN, VietQR, tích hợp 20+ ngân hàng VN.", color: "#06b6d4" },
  { icon: Workflow, title: "Event-Driven", desc: "NATS JetStream cho inter-module communication. 25 typed event schemas, real-time sync giữa các modules.", color: "#f59e0b" },
  { icon: Cloud, title: "Multi-Cloud Ready", desc: "Terraform cho AWS (EKS), GCP (GKE), Azure (AKS). Helm charts, Docker, CI/CD GitHub Actions.", color: "#ec4899" },
  { icon: Users, title: "Developer Experience", desc: "TypeScript strict, Turborepo, Prisma ORM, Playwright E2E. npm run setup chạy mọi nơi.", color: "#5e6ad2" },
];

export default function Features() {
  return (
    <section id="features" className="py-[80px] md:py-[120px] bg-bg-secondary relative overflow-hidden">
      <CircuitBackground variant="features" className="opacity-60" />
      <div className="max-w-[1400px] mx-auto px-5 md:px-6 relative z-10">
        <ScrollReveal className="text-center mb-16 max-w-[600px] mx-auto">
          <p className="text-[12px] text-white tracking-[0.08em] uppercase mb-4 font-medium">Platform Features</p>
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-4">
            <span className="gradient-text">Nền tảng vững chắc.</span><br />
            <span className="text-text-tertiary">Kiến trúc chuẩn doanh nghiệp.</span>
          </h2>
          <p className="text-[14px] text-text-tertiary leading-[1.7]">
            16 modules chia sẻ 27 shared packages, kiến trúc microservices, event-driven, multi-tenant.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border overflow-hidden">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.06}>
              <motion.div whileHover={{ backgroundColor: "rgba(26, 27, 30, 1)" }} className="p-8 bg-bg-secondary hover:bg-bg-tertiary transition-colors duration-300 h-full group relative">
                <div className="absolute top-4 right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <f.icon size={80} strokeWidth={1} />
                </div>
                <div className="w-9 h-9 flex items-center justify-center mb-5 transition-colors" style={{ backgroundColor: `${f.color}15` }}>
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <h3 className="text-[15px] font-semibold mb-2 tracking-[-0.01em] text-text-primary">{f.title}</h3>
                <p className="text-[14px] text-text-tertiary leading-[1.65]">{f.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
