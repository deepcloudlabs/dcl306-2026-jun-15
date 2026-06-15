names = ["ali", "zehra", "şule", "şima", "ayşe"]
names.sort((name1,name2) => name1.localeCompare(name2,"tr-TR"))
console.log(names);

name1 = "şima";
name2 = "zehra";
console.log(name1.localeCompare(name2,"tr-TR"));