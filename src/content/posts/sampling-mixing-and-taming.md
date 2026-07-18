---
title: "Sampling, Mixing, and Taming"
date: "2026-07-18"
summary: "An introduction to Langevin algorithms and why sampling becomes difficult beyond the classical setting."
---

Many machine learning problems can be viewed as sampling from a probability distribution rather than simply optimizing an objective.

Langevin algorithms provide an elegant connection between probability, optimization, and stochastic differential equations. Their behavior, however, changes dramatically once we leave the comfort of convexity and global smoothness.

Suppose the target distribution is

$$
\pi_\beta(x) \propto e^{-\beta u(x)}.
$$

The corresponding Langevin diffusion is

$$
dX_t=-\nabla u(X_t)\,dt+\sqrt{\frac{2}{\beta}}\,dW_t,
$$

whose invariant distribution is $\pi_\beta$.

The simplest numerical approximation is the Unadjusted Langevin Algorithm

$$
X_{n+1}=X_n-\lambda\nabla u(X_n)+\sqrt{\frac{2\lambda}{\beta}}\,\xi_{n+1}.
$$

When $\nabla u$ is globally Lipschitz, the discretization error can be controlled with classical arguments. When the drift is only locally Lipschitz and grows super-linearly, the same Euler step may become unstable.

Taming replaces the original drift $h$ by a step-size-dependent approximation $h_\lambda$ that grows at most linearly while satisfying $h_\lambda(x)\to h(x)$ as $\lambda\to0$. In our work, we use

$$
h_\lambda(x)=ax+\frac{h(x)-ax}{\left(1+\lambda\|x\|^{2(\ell+1)}\right)^{1/2}}.
$$

This leads to two stable discretizations: the tamed Euler scheme kTULA and a tamed randomized midpoint scheme, tRLMC.

To measure convergence, we consider several complementary notions of distance between probability distributions. The Kullback--Leibler divergence is

$$
\mathrm{KL}(\mu\|\nu)=\int \log\!\left(\frac{d\mu}{d\nu}\right)d\mu,
$$

total variation measures the largest difference in probability assigned to the same event, and the Wasserstein distance $W_2$ measures the minimal quadratic transportation cost between two distributions.

The target distribution is assumed to satisfy a logarithmic Sobolev inequality

$$
\mathrm{KL}(\mu\|\pi_\beta)\leq\frac{1}{2C_{\mathrm{LSI}}}I_{\pi_\beta}(\mu).
$$

The LSI converts entropy dissipation of the continuous Langevin diffusion into exponential convergence toward $\pi_\beta$. It also implies a transportation inequality of the form

$$
W_2(\mu,\pi_\beta)^2\leq\frac{2}{C_{\mathrm{LSI}}}\mathrm{KL}(\mu\|\pi_\beta).
$$

Our analysis separates two sources of error: the mixing error of the continuous diffusion and the discretization error introduced by the numerical scheme.

For kTULA, we establish finite-time bounds in KL divergence and derive corresponding guarantees in total variation and $W_2$. For tRLMC, we establish finite-time bounds directly in total variation and obtain Wasserstein convergence as well.

The main point is that taming preserves stability without discarding the original Langevin dynamics. This makes it possible to obtain non-asymptotic sampling guarantees even when the drift grows super-linearly and the target distribution is non-log-concave.

