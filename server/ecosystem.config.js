module.exports = {
  apps: [
    {
      name: "local",
      script: "npm run server",
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      args: "one two",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 2001,
        DB_HOST: "mongodb://192.168.0.6:40017",
        DB_USER: "",
        DB_PASS: "",
        DB_PORT: 40017,
        DB_DATABASE: "Notes",
        DEBUG: "email-templates node server.js"
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 2002,
        DB_HOST: "mongodb://192.168.0.6:40017",
        DB_USER: "",
        DB_PASS: "",
        DB_PORT: 40017,
        DB_DATABASE: "Notes"
      },
      env_staging: {
        NODE_ENV: "staging",
        PORT: 2003,
        DB_HOST: "mongodb://192.168.0.6:40017",
        DB_USER: "",
        DB_PASS: "",
        DB_PORT: 40017,
        DB_DATABASE: "Notes"
      }
    }
    // ,{
    //   name: "myapp",
    //   script: "npm run dev",

    //   // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //   args: "one two",
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: "1G",
    //   env: {
    //     NODE_ENV: "staging",
    //     PORT: 3001,
    //     DB_HOST: "mongodb://192.168.0.6:40017",
    //     DB_USER: "",
    //     DB_PASS: "",
    //     DB_PORT: 40017,
    //     DB_DATABASE: "Notes"
    //   }
    //}
  ],

  deploy: {
    production: {
      user: "node",
      host: "212.83.163.1",
      ref: "origin/master",
      repo: "git@github.com:repo.git",
      path: "/var/www/production",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production"
    }
  }
};
