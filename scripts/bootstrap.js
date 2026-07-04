(async () => {
  try {
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    const base = 'http://localhost:4000';

    console.log('1) Signing up user via API...');
    let token = null;
    let user = null;
    const signupRes = await fetch(base + '/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@a.com', password: 'pass123' })
    });
    const signup = await signupRes.json();
    if (signup.error) {
      // If the email already exists, try to login instead
      if (signup.error.code === 'EMAIL_EXISTS') {
        console.log('Email exists — logging in instead...');
        const loginRes = await fetch(base + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'a@a.com', password: 'pass123' })
        });
        const login = await loginRes.json();
        if (login.error) throw new Error('Login failed: ' + JSON.stringify(login.error));
        token = login.token;
        user = login.user;
        console.log('Login OK, user id=', user.id);
      } else {
        throw new Error('Signup failed: ' + JSON.stringify(signup.error));
      }
    } else {
      token = signup.token;
      user = signup.user;
      console.log('Signup OK, user id=', user.id);
    }

    console.log('2) Creating Organization, Project, Queue via Prisma...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    let retryPolicy = await prisma.retryPolicy.findFirst();
    if (!retryPolicy) {
      retryPolicy = await prisma.retryPolicy.create({ data: { strategy: 'EXPONENTIAL', maxAttempts: 5, baseDelayMs: 1000, maxDelayMs: 60000 } });
    }

    const org = await prisma.organization.create({ data: { name: 'Default Org' } });
    await prisma.organizationMember.create({ data: { organizationId: org.id, userId: user.id, role: 'OWNER' } });
    const project = await prisma.project.create({ data: { name: 'Default Project', organizationId: org.id } });
    const queue = await prisma.queue.create({ data: { name: 'default', projectId: project.id, retryPolicyId: retryPolicy.id } });

    console.log('Created queue id=', queue.id);

    console.log('3) Submitting job via API...');
    const submitRes = await fetch(base + `/jobs/${queue.id}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ payload: { type: 'test', message: 'hello' } })
    });
    const job = await submitRes.json();
    if (job.error) throw new Error('Job submit failed: ' + JSON.stringify(job.error));
    console.log('Job created:', job.id);

    console.log('Done.');
    await prisma.$disconnect();
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
