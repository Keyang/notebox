module.exports=function(data,options){
  data.forEach(function(item){
    process.stdout.write(item.data);
    // console.log(item.data);
  });
}
