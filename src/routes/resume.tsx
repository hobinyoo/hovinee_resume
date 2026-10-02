import { createFileRoute, redirect } from "@tanstack/react-router"

// 이력서가 홈(/)으로 올라가서, 예전 /resume 링크는 홈으로 보낸다.
export const Route = createFileRoute("/resume")({
  beforeLoad: () => {
    throw redirect({ to: "/" })
  },
})
