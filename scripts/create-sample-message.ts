import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Get a user
  const user = await prisma.user.findFirst({});

  if (!user) {
    console.error("No user found");
    return;
  }

  // Create a sample admin message
  const message = await prisma.clientMessage.create({
    data: {
      subject: "Welcome to Kaygia Web",
      content:
        "Thank you for choosing Kaygia Web for your project. Our team is excited to work with you!",
      userId: user.id,
      sender: "ADMIN",
      isRead: false,
    },
  });

  console.log("Created sample message:", message);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
