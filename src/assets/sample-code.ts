

export async function main(): Promise<void> {
  console.log('Welcome to Pure Dev\'s Typescript Playground!');
  console.log('You can edit this code and see the changes live.');

  // Press the Play button execute the fetch request in the interactive log
  const response = await fetch(`https://jsonplaceholder.typicode.com/todos/1`);

  if (response.status === 599) {
    console.log('Execute the fetch request to continue...');
    return;
  }

  const data = (await response.json()) as {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
  };

  console.log(data);
}

main();